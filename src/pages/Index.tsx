import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { productsApi } from '@/lib/api';

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

interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
}

const defaultProducts: Product[] = [
  {
    id: 1,
    name: 'Футболка "Веселый Зоопарк"',
    price: 1290,
    oldPrice: 1690,
    image: 'https://cdn.poehali.dev/projects/f08fb6cc-16bf-44af-999b-6ea8b8a7944e/files/57c6be5f-a7f6-40a1-ba17-3441ecd3b038.jpg',
    category: 'Футболки',
    sizes: ['92-98', '104-110', '116-122', '128-134'],
    colors: ['yellow', 'blue', 'white'],
    rating: 4.9,
    reviews: 89,
    discount: 25,
    isNew: true,
    isTrending: true
  },
  {
    id: 2,
    name: 'Платье "Цветочная Поляна"',
    price: 2490,
    oldPrice: 3290,
    image: 'https://cdn.poehali.dev/projects/f08fb6cc-16bf-44af-999b-6ea8b8a7944e/files/719ff5d6-39cd-4c30-8427-8797bba3eccd.jpg',
    category: 'Платья',
    sizes: ['92-98', '104-110', '116-122'],
    colors: ['pink', 'white', 'lavender'],
    rating: 5.0,
    reviews: 124,
    discount: 25,
    isNew: true,
    isTrending: true
  },
  {
    id: 3,
    name: 'Худи "Мятный Мишка"',
    price: 1990,
    image: 'https://cdn.poehali.dev/projects/f08fb6cc-16bf-44af-999b-6ea8b8a7944e/files/ad87e5cb-3a5a-4b4f-8bfd-c0ff283b13f9.jpg',
    category: 'Худи',
    sizes: ['92-98', '104-110', '116-122', '128-134', '140-146'],
    colors: ['mint', 'gray', 'white'],
    rating: 4.8,
    reviews: 67,
    isTrending: true
  }
];

export default function Index() {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  // const [cart, setCart] = useState<CartItem[]>([]);
  const [contacts, setContacts] = useState({
    address: 'Москва, ул. Модная, 123',
    phone: '+7 (999) 123-45-67',
    email: 'hello@vibestore.com'
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await productsApi.getAll();
      if (data.length > 0) {
        const formattedProducts: Product[] = data.map(p => ({
          id: p.id!,
          name: p.name,
          price: p.price,
          oldPrice: undefined,
          image: p.image || '',
          category: p.category,
          sizes: [],
          colors: [],
          rating: 5.0,
          reviews: 0,
          isNew: false,
          isTrending: false
        }));
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    
    const storedContacts = localStorage.getItem('kids-fashion-contacts');
    if (storedContacts) {
      setContacts(JSON.parse(storedContacts));
    }

    const interval = setInterval(loadProducts, 3000);
    return () => clearInterval(interval);
  }, [loadProducts]);

  const handleRegister = () => {
    if (!registerForm.name || !registerForm.email || !registerForm.phone) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }
    const users = JSON.parse(localStorage.getItem('kids-fashion-users') || '[]');
    const newUser = {
      id: Date.now(),
      ...registerForm,
      registeredAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem('kids-fashion-users', JSON.stringify(users));
    toast({
      title: 'Регистрация успешна!',
      description: `Добро пожаловать, ${registerForm.name}!`,
    });
    setRegisterForm({ name: '', email: '', phone: '' });
    setShowRegisterForm(false);
  };
  const [activeTab, setActiveTab] = useState('catalog');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '' });
  const { toast } = useToast();

  const allCategories = ['Все', 'Новинки', 'Тренды', ...new Set(products.map(p => p.category))];
  const allSizes = ['80-86', '92-98', '104-110', '116-122', '128-134', '140-146', '152-158'];

  // const addToCart = (product: Product, size: string) => {
  //   const existingItem = cart.find(item => item.id === product.id && item.selectedSize === size);
  //   if (existingItem) {
  //     setCart(cart.map(item =>
  //       item.id === product.id && item.selectedSize === size
  //         ? { ...item, quantity: item.quantity + 1 }
  //         : item
  //     ));
  //   } else {
  //     setCart([...cart, { ...product, quantity: 1, selectedSize: size }]);
  //   }
  // };

  // const removeFromCart = (productId: number, size: string) => {
  //   setCart(cart.filter(item => !(item.id === productId && item.selectedSize === size)));
  // };

  // const updateQuantity = (productId: number, size: string, quantity: number) => {
  //   if (quantity === 0) {
  //     removeFromCart(productId, size);
  //   } else {
  //     setCart(cart.map(item =>
  //       item.id === productId && item.selectedSize === size
  //         ? { ...item, quantity }
  //         : item
  //     ));
  //   }
  // };

  // const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // const totalDiscount = cart.reduce((sum, item) => {
  //   const itemDiscount = item.oldPrice ? (item.oldPrice - item.price) * item.quantity : 0;
  //   return sum + itemDiscount;
  // }, 0);

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'Все') {
      if (selectedCategory === 'Новинки' && !product.isNew) return false;
      if (selectedCategory === 'Тренды' && !product.isTrending) return false;
      if (!['Новинки', 'Тренды'].includes(selectedCategory) && product.category !== selectedCategory) return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    if (selectedSizes.length > 0 && !product.sizes.some(size => selectedSizes.includes(size))) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-pink-400 to-yellow-400 bg-clip-text text-transparent flex items-center gap-2">
              👶 Kids Fashion
            </h1>
            
            <nav className="hidden md:flex gap-6">
              <Button 
                variant={activeTab === 'catalog' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('catalog')}
                className="font-semibold"
              >
                Каталог
              </Button>
              <Button 
                variant={activeTab === 'about' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('about')}
              >
                О нас
              </Button>
              <Button 
                variant={activeTab === 'contacts' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('contacts')}
              >
                Контакты
              </Button>
            </nav>

            <div className="flex items-center gap-3">
              <Sheet open={showRegisterForm} onOpenChange={setShowRegisterForm}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Icon name="User" size={22} />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Регистрация</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Ваше имя *</label>
                      <input
                        type="text"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        placeholder="Иван Иванов"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Email *</label>
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        placeholder="ivan@example.com"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">Телефон *</label>
                      <input
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        placeholder="+7 (999) 123-45-67"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <Button onClick={handleRegister} className="w-full" size="lg">
                      <Icon name="UserPlus" size={18} className="mr-2" />
                      Зарегистрироваться
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              

            </div>
          </div>
        </div>
      </header>

      {activeTab === 'catalog' && (
        <main className="container mx-auto px-4 py-8">
          <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400 p-12 text-white animate-fade-in">
            <div className="relative z-10">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">🎉 Новая коллекция</Badge>
              <h2 className="text-5xl font-bold mb-4">Мода для маленьких героев</h2>
              <p className="text-xl mb-6 text-white/90">Яркая, удобная и безопасная одежда для детей</p>
              <Button size="lg" variant="secondary" className="font-semibold">
                Смотреть коллекцию
                <Icon name="ArrowRight" size={20} className="ml-2" />
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-64 space-y-6">
              <Card className="p-6 animate-scale-in">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Icon name="Filter" size={20} />
                  Фильтры
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Категория</h4>
                    <div className="space-y-2">
                      {allCategories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? 'default' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Цена</h4>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={15000}
                      step={500}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{priceRange[0]} ₽</span>
                      <span>{priceRange[1]} ₽</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Размер</h4>
                    <div className="space-y-2">
                      {allSizes.map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                          <Checkbox
                            id={size}
                            checked={selectedSizes.includes(size)}
                            onCheckedChange={(checked) => {
                              setSelectedSizes(
                                checked
                                  ? [...selectedSizes, size]
                                  : selectedSizes.filter(s => s !== size)
                              );
                            }}
                          />
                          <label htmlFor={size} className="text-sm cursor-pointer">
                            {size}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedCategory === 'Все' ? 'Все товары' : selectedCategory}
                </h2>
                <span className="text-muted-foreground">{filteredProducts.length} товаров</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <Card 
                    key={product.id} 
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.isNew && (
                            <Badge className="bg-blue-500">✨ Новинка</Badge>
                          )}
                          {product.isTrending && (
                            <Badge className="bg-yellow-500 text-yellow-950">🔥 Хит</Badge>
                          )}
                          {product.discount && (
                            <Badge className="bg-pink-500">-{product.discount}%</Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Icon name="Star" size={16} className="fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{product.rating}</span>
                          <span className="text-sm text-muted-foreground">({product.reviews})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {product.oldPrice && (
                            <span className="text-muted-foreground line-through">{product.oldPrice} ₽</span>
                          )}
                          <span className="text-xl font-bold text-primary">{product.price} ₽</span>
                        </div>

                        <div>
                          <p className="text-sm font-semibold mb-2">Размеры:</p>
                          <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                              <Badge key={size} variant="outline">
                                {size}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {activeTab === 'about' && (
        <main className="container mx-auto px-4 py-16 animate-fade-in">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold mb-6">О нас</h2>
            <p className="text-lg text-muted-foreground">
              Kids Fashion — это магазин качественной и стильной детской одежды. 
              Мы заботимся о комфорте и безопасности вашего ребенка, выбирая только 
              натуральные ткани и проверенные производители.
            </p>
            <p className="text-lg text-muted-foreground">
              Наша миссия — помочь родителям выбрать лучшее для своих детей: 
              красивое, удобное и доступное по цене.
            </p>
          </div>
        </main>
      )}

      {activeTab === 'contacts' && (
        <main className="container mx-auto px-4 py-16 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center">Контакты</h2>
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Icon name="MapPin" size={24} className="text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Адрес</h3>
                    <p className="text-muted-foreground">{contacts.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Icon name="Phone" size={24} className="text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Телефон</h3>
                    <p className="text-muted-foreground">{contacts.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Icon name="Mail" size={24} className="text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">{contacts.email}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      )}

      <footer className="bg-gradient-to-r from-blue-600 via-pink-500 to-yellow-500 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">👶 Kids Fashion</h3>
          <p className="text-white/80 mb-4">Счастливое детство начинается здесь</p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/20">
              <Icon name="Instagram" size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/20">
              <Icon name="Facebook" size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-white/20">
              <Icon name="Twitter" size={20} />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}