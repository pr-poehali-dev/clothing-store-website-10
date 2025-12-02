"""
Business: API для управления товарами интернет-магазина одежды
Args: event - dict с httpMethod, body, queryStringParameters, pathParams
      context - object с атрибутами: request_id, function_name
Returns: HTTP response dict с данными товаров
"""

import json
import os
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = None
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # GET - получить все товары
        if method == 'GET':
            cur.execute("""
                SELECT id, name, price, description, category, image, 
                       created_at, updated_at 
                FROM products 
                ORDER BY created_at DESC
            """)
            products = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(p) for p in products], default=str),
                'isBase64Encoded': False
            }
        
        # POST - создать товар
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name')
            price = body_data.get('price')
            description = body_data.get('description', '')
            category = body_data.get('category')
            image = body_data.get('image', '')
            
            if not name or price is None or not category:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Name, price, and category are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                INSERT INTO products (name, price, description, category, image)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, name, price, description, category, image, created_at, updated_at
            """, (name, price, description, category, image))
            
            product = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(product), default=str),
                'isBase64Encoded': False
            }
        
        # PUT - обновить товар
        elif method == 'PUT':
            path_params = event.get('pathParams', {})
            product_id = path_params.get('id')
            
            if not product_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Product ID is required'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name')
            price = body_data.get('price')
            description = body_data.get('description')
            category = body_data.get('category')
            image = body_data.get('image')
            
            cur.execute("""
                UPDATE products 
                SET name = COALESCE(%s, name),
                    price = COALESCE(%s, price),
                    description = COALESCE(%s, description),
                    category = COALESCE(%s, category),
                    image = COALESCE(%s, image),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, name, price, description, category, image, created_at, updated_at
            """, (name, price, description, category, image, product_id))
            
            product = cur.fetchone()
            
            if not product:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Product not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(product), default=str),
                'isBase64Encoded': False
            }
        
        # DELETE - удалить товар
        elif method == 'DELETE':
            path_params = event.get('pathParams', {})
            product_id = path_params.get('id')
            
            if not product_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Product ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM products WHERE id = %s RETURNING id", (product_id,))
            deleted = cur.fetchone()
            
            if not deleted:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Product not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Product deleted successfully', 'id': deleted['id']}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        if conn:
            conn.close()
