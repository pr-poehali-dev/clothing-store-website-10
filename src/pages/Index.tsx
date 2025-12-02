import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

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

const products: Product[] = [
  {
    id: 1,
    name: 'Neo Hoodie Purple',
    price: 4990,
    oldPrice: 6990,
    image: 'https://cdn.poehali.dev/projects/f08fb6cc-16bf-44af-999b-6ea8b8a7944e/files/ea673fe9-78cc-4cbc-8bc1-f45cd12f94ba.jpg',
    category: 'Толстовки',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['purple', 'pink', 'black'],
    rating: 4.8,
    reviews: 124,
    discount: 30,
    isNew: true,
    isTrending: true
  },
  {
    id: 2,
    name: 'Cyber Denim Jacket',
    price: 7990,
    oldPrice: 9990,
    image: 'https://cdn.poehali.dev/projects/f08fb6cc-16bf-44af-999b-6ea8b8a7944e/files/0cdcc5c0-8d2c-490d-b20f-c9c622d1a330.jpg',
    category: 'Куртки',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['blue', 'black'],
    rating: 4.9,
    reviews: 89,
    discount: 20,
    isTrending: true
  },
  {
    id: 3,
    name: 'Future Sneakers',
    price: 8990,
    image: 'https://cdn.poehali.dev/projects/f08fb6cc-16bf-44af-999b-6ea8b8a7944e/files/98939dad-1066-44c8-9c9a-2ef8426896d3.jpg',
    category: 'Обувь',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['orange', 'blue', 'white'],
    rating: 4.7,
    reviews: 156,
    isNew: true,
    isTrending: true
  }
];

export default function Index() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('catalog');

  const categories = ['Все', 'Новинки', 'Тренды', 'Толстовки', 'Куртки', 'Обувь'];
  const allSizes = ['XS', 'S', 'M', 'L', 'XL'];

  const addToCart = (product: Product, size: string) => {
    const existingItem = cart.find(item => item.id === product.id && item.selectedSize === size);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id && item.selectedSize === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, selectedSize: size }]);
    }
  };

  const removeFromCart = (productId: number, size: string) => {
    setCart(cart.filter(item => !(item.id === productId && item.selectedSize === size)));
  };

  const updateQuantity = (productId: number, size: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId, size);
    } else {
      setCart(cart.map(item =>
        item.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => {
    const itemDiscount = item.oldPrice ? (item.oldPrice - item.price) * item.quantity : 0;
    return sum + itemDiscount;
  }, 0);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              VIBE STORE
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
              <Button variant="ghost" size="icon" className="relative">
                <Icon name="User" size={22} />
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Icon name="ShoppingCart" size={22} />
                    {cart.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-bold">Корзина</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-8 space-y-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-12">
                        <Icon name="ShoppingBag" size={64} className="mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Корзина пуста</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 max-h-[50vh] overflow-auto">
                          {cart.map((item) => (
                            <Card key={`${item.id}-${item.selectedSize}`}>
                              <CardContent className="p-4">
                                <div className="flex gap-4">
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground">Размер: {item.selectedSize}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="font-bold text-primary">{item.price} ₽</span>
                                      <div className="flex items-center gap-2">
                                        <Button 
                                          size="icon" 
                                          variant="outline"
                                          className="h-7 w-7"
                                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                                        >
                                          <Icon name="Minus" size={14} />
                                        </Button>
                                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                        <Button 
                                          size="icon" 
                                          variant="outline"
                                          className="h-7 w-7"
                                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                                        >
                                          <Icon name="Plus" size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        <div className="border-t pt-4 space-y-2">
                          {totalDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Скидка</span>
                              <span className="text-green-600 font-semibold">-{totalDiscount} ₽</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold">
                            <span>Итого</span>
                            <span className="text-primary">{totalPrice} ₽</span>
                          </div>
                        </div>
                        
                        <Button className="w-full" size="lg">
                          Оформить заказ
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {activeTab === 'catalog' && (
        <main className="container mx-auto px-4 py-8">
          <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-12 text-white animate-fade-in">
            <div className="relative z-10">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">Новая коллекция</Badge>
              <h2 className="text-5xl font-bold mb-4">Стиль будущего</h2>
              <p className="text-xl mb-6 text-white/90">Яркие образы для смелых личностей</p>
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
                      {categories.map((category) => (
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
                            <Badge className="bg-purple-600">Новинка</Badge>
                          )}
                          {product.isTrending && (
                            <Badge className="bg-orange-500">Тренд</Badge>
                          )}
                          {product.discount && (
                            <Badge className="bg-pink-600">-{product.discount}%</Badge>
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
                              <Button
                                key={size}
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(product, size)}
                                className="hover:bg-primary hover:text-primary-foreground"
                              >
                                {size}
                              </Button>
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
              VIBE STORE — это больше, чем магазин одежды. Мы создаем будущее моды, 
              объединяя смелый дизайн, яркие цвета и инновационные формы.
            </p>
            <p className="text-lg text-muted-foreground">
              Наша миссия — помочь вам выразить себя через стиль, который не боится выделяться.
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
                    <p className="text-muted-foreground">Москва, ул. Модная, 123</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Icon name="Phone" size={24} className="text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Телефон</h3>
                    <p className="text-muted-foreground">+7 (999) 123-45-67</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Icon name="Mail" size={24} className="text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">hello@vibestore.com</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>
      )}

      <footer className="bg-gradient-to-r from-purple-900 via-pink-900 to-orange-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">VIBE STORE</h3>
          <p className="text-white/80 mb-4">Стиль будущего уже здесь</p>
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
