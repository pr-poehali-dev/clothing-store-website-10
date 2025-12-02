import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  rating: number;
  reviews: number;
  discount?: number;
  isNew?: boolean;
  isTrending?: boolean;
}

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
}

const categories = ['Футболки', 'Платья', 'Худи', 'Брюки', 'Куртки', 'Обувь'];
const availableSizes = ['2-3 года', '4-5 лет', '6-7 лет', '8-9 лет', '10-11 лет', '12-13 лет'];

export default function Admin() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'contacts'>('products');
  const [contacts, setContacts] = useState<ContactInfo>({
    address: 'Москва, ул. Модная, 123',
    phone: '+7 (999) 123-45-67',
    email: 'hello@vibestore.com'
  });

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    oldPrice: '',
    image: '',
    category: categories[0],
    sizes: [] as string[],
    colors: '',
    rating: '5.0',
    reviews: '0',
    isNew: false,
    isTrending: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem('kids-fashion-products');
    if (stored) {
      setProducts(JSON.parse(stored));
    }
    
    const storedContacts = localStorage.getItem('kids-fashion-contacts');
    if (storedContacts) {
      setContacts(JSON.parse(storedContacts));
    }
    
    const auth = sessionStorage.getItem('admin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-auth', 'true');
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать в админ-панель',
      });
    } else {
      toast({
        title: 'Ошибка входа',
        description: 'Неверный пароль',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin-auth');
  };

  const saveProducts = (newProducts: Product[]) => {
    localStorage.setItem('kids-fashion-products', JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price);
    const oldPrice = formData.oldPrice ? parseFloat(formData.oldPrice) : undefined;
    const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : undefined;

    const newProduct: Product = {
      id: editingId || Date.now(),
      name: formData.name,
      price,
      oldPrice,
      image: formData.image,
      category: formData.category,
      sizes: formData.sizes,
      colors: formData.colors.split(',').map(c => c.trim()),
      rating: parseFloat(formData.rating),
      reviews: parseInt(formData.reviews),
      discount,
      isNew: formData.isNew,
      isTrending: formData.isTrending,
    };

    if (editingId) {
      const updated = products.map(p => p.id === editingId ? newProduct : p);
      saveProducts(updated);
      toast({
        title: 'Товар обновлён',
        description: `${newProduct.name} успешно обновлён`,
      });
      setEditingId(null);
    } else {
      saveProducts([...products, newProduct]);
      toast({
        title: 'Товар добавлен',
        description: `${newProduct.name} добавлен в каталог`,
      });
    }

    setFormData({
      name: '',
      price: '',
      oldPrice: '',
      image: '',
      category: categories[0],
      sizes: [],
      colors: '',
      rating: '5.0',
      reviews: '0',
      isNew: false,
      isTrending: false,
    });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      oldPrice: product.oldPrice?.toString() || '',
      image: product.image,
      category: product.category,
      sizes: product.sizes,
      colors: product.colors.join(', '),
      rating: product.rating.toString(),
      reviews: product.reviews.toString(),
      isNew: product.isNew || false,
      isTrending: product.isTrending || false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
    toast({
      title: 'Товар удалён',
      description: 'Товар успешно удалён из каталога',
    });
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const saveContacts = () => {
    localStorage.setItem('kids-fashion-contacts', JSON.stringify(contacts));
    toast({
      title: 'Контакты сохранены',
      description: 'Контактная информация успешно обновлена',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              <Icon name="Lock" size={32} className="mx-auto mb-4 text-primary" />
              Вход в админ-панель
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                />
              </div>
              <Button type="submit" className="w-full">
                Войти
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Подсказка: admin123
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-pink-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Icon name="Settings" size={28} className="text-primary" />
                Админ-панель Kids Fashion
              </h1>
              <p className="text-sm text-muted-foreground">Управление товарами магазина</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <a href="/">
                  <Icon name="Home" size={18} className="mr-2" />
                  На сайт
                </a>
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <Icon name="LogOut" size={18} className="mr-2" />
                Выход
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
          >
            <Icon name="Package" size={18} className="mr-2" />
            Товары
          </Button>
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('contacts')}
          >
            <Icon name="Phone" size={18} className="mr-2" />
            Контакты
          </Button>
        </div>

        {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name={editingId ? "Edit" : "Plus"} size={24} />
                {editingId ? 'Редактировать товар' : 'Добавить товар'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Название товара *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='Футболка "Весёлый Зоопарк"'
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Цена (₽) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="1290"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="oldPrice">Старая цена (₽)</Label>
                    <Input
                      id="oldPrice"
                      type="number"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      placeholder="1690"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Ссылка на изображение *</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Категория *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Размеры *</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableSizes.map(size => (
                      <Button
                        key={size}
                        type="button"
                        variant={formData.sizes.includes(size) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="colors">Цвета (через запятую) *</Label>
                  <Input
                    id="colors"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="yellow, blue, white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Рейтинг</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviews">Отзывов</Label>
                    <Input
                      id="reviews"
                      type="number"
                      value={formData.reviews}
                      onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNew"
                      checked={formData.isNew}
                      onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked as boolean })}
                    />
                    <Label htmlFor="isNew" className="cursor-pointer">Новинка</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isTrending"
                      checked={formData.isTrending}
                      onCheckedChange={(checked) => setFormData({ ...formData, isTrending: checked as boolean })}
                    />
                    <Label htmlFor="isTrending" className="cursor-pointer">Хит продаж</Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Icon name={editingId ? "Save" : "Plus"} size={18} className="mr-2" />
                    {editingId ? 'Сохранить' : 'Добавить товар'}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={() => {
                      setEditingId(null);
                      setFormData({
                        name: '',
                        price: '',
                        oldPrice: '',
                        image: '',
                        category: categories[0],
                        sizes: [],
                        colors: '',
                        rating: '5.0',
                        reviews: '0',
                        isNew: false,
                        isTrending: false,
                      });
                    }}>
                      Отмена
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon name="Package" size={24} />
                    Товары в каталоге
                  </span>
                  <Badge variant="secondary">{products.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[800px] overflow-y-auto">
                {products.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Package" size={64} className="mx-auto mb-4 opacity-20" />
                    <p>Пока нет товаров</p>
                    <p className="text-sm">Добавьте первый товар через форму слева</p>
                  </div>
                ) : (
                  products.map(product => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold">{product.name}</h3>
                                <p className="text-sm text-muted-foreground">{product.category}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEdit(product)}
                                >
                                  <Icon name="Edit" size={16} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(product.id)}
                                >
                                  <Icon name="Trash2" size={16} />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              {product.oldPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {product.oldPrice} ₽
                                </span>
                              )}
                              <span className="font-bold text-primary">{product.price} ₽</span>
                              {product.discount && (
                                <Badge variant="secondary" className="bg-pink-500 text-white">
                                  -{product.discount}%
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {product.isNew && <Badge className="bg-blue-500 text-xs">✨ Новинка</Badge>}
                              {product.isTrending && <Badge className="bg-yellow-500 text-yellow-950 text-xs">🔥 Хит</Badge>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {activeTab === 'contacts' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Phone" size={24} />
                  Контактная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    value={contacts.address}
                    onChange={(e) => setContacts({ ...contacts, address: e.target.value })}
                    placeholder="Москва, ул. Модная, 123"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={contacts.phone}
                    onChange={(e) => setContacts({ ...contacts, phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contacts.email}
                    onChange={(e) => setContacts({ ...contacts, email: e.target.value })}
                    placeholder="hello@kidsfashion.com"
                  />
                </div>
                <Button onClick={saveContacts} className="w-full">
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить контакты
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}