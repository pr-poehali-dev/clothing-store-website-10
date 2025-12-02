"""
Business: API для управления контактной информацией магазина
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с атрибутами: request_id, function_name
Returns: HTTP response dict с данными контактов
"""

import json
import os
from typing import Dict, Any
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
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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
        
        # GET - получить контакты
        if method == 'GET':
            cur.execute("""
                SELECT id, address, phone, email, created_at, updated_at 
                FROM contacts 
                ORDER BY id DESC 
                LIMIT 1
            """)
            contact = cur.fetchone()
            
            if not contact:
                # Если контактов нет, вернем дефолтные
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'address': 'Москва, ул. Модная, 123',
                        'phone': '+7 (999) 123-45-67',
                        'email': 'hello@vibestore.com'
                    }),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(contact), default=str),
                'isBase64Encoded': False
            }
        
        # PUT - обновить контакты
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            address = body_data.get('address')
            phone = body_data.get('phone')
            email = body_data.get('email')
            
            if not address or not phone or not email:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Address, phone, and email are required'}),
                    'isBase64Encoded': False
                }
            
            # Проверяем, есть ли уже контакты
            cur.execute("SELECT id FROM contacts ORDER BY id DESC LIMIT 1")
            existing = cur.fetchone()
            
            if existing:
                # Обновляем существующие
                cur.execute("""
                    UPDATE contacts 
                    SET address = %s,
                        phone = %s,
                        email = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id, address, phone, email, created_at, updated_at
                """, (address, phone, email, existing['id']))
            else:
                # Создаем новые
                cur.execute("""
                    INSERT INTO contacts (address, phone, email)
                    VALUES (%s, %s, %s)
                    RETURNING id, address, phone, email, created_at, updated_at
                """, (address, phone, email))
            
            contact = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(contact), default=str),
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
