const API_BASE_URL = 'https://functions.poehali.dev/b4428f64-79b6-4d0d-8842-dbe8f5fe1b76';
const CONTACTS_API_URL = 'https://functions.poehali.dev/8fa276e9-6714-4b8a-ad1b-6aa7c263936e';

export interface Product {
  id?: number;
  name: string;
  price: number;
  description?: string;
  category: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactInfo {
  id?: number;
  address: string;
  phone: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export const productsApi = {
  async getAll(): Promise<Product[]> {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return response.json();
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product');
    }
    
    return response.json();
  },

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product');
    }
    
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }
  },
};

export const contactsApi = {
  async get(): Promise<ContactInfo> {
    const response = await fetch(CONTACTS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }
    
    return response.json();
  },

  async update(contacts: ContactInfo): Promise<ContactInfo> {
    const response = await fetch(CONTACTS_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contacts),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update contacts');
    }
    
    return response.json();
  },
};