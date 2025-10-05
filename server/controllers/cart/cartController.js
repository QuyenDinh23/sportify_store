import Cart from '../../models/cart/Cart.js';
import Product from '../../models/product/Product.js';

// Lấy giỏ hàng của user
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findOne({ userId: userId }).populate('items.productId');
    
    if (!cart) {
      // Tạo cart mới nếu chưa có
      cart = new Cart({
        userId: userId,
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
        status: 'active'
      });
      await cart.save();
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy giỏ hàng',
      error: error.message
    });
  }
};

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (req, res) => {
  try {
    console.log("Add to Cart Request:", req.body);
    const userId = req.user.id;
    const { productId, selectedColor, selectedSize, quantity } = req.body;
    
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }
    
    // Tìm color index từ selectedColor (có thể là index hoặc name)
    console.log("Product colors:", product.colors);
    console.log("Selected color:", selectedColor, "Type:", typeof selectedColor);
    
    let colorIndex;
    if (typeof selectedColor === 'number') {
      colorIndex = selectedColor;
    } else {
      colorIndex = product.colors.findIndex(color => color.name === selectedColor);
    }
    
    console.log("Color index found:", colorIndex);
    
    if (colorIndex === -1 || !product.colors[colorIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Màu sắc không hợp lệ'
      });
    }
    
    const selectedColorObj = product.colors[colorIndex];
    console.log("Selected color object:", selectedColorObj);
    
    // Kiểm tra size có hợp lệ không - sử dụng product.sizes thay vì color.sizes
    if (!product.sizes.includes(selectedSize)) {
      return res.status(400).json({
        success: false,
        message: 'Kích thước không hợp lệ'
      });
    }
    
    // Kiểm tra số lượng tồn kho - sử dụng stockQuantity tổng
    const availableStock = product.stockQuantity;
    if (quantity > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${availableStock} sản phẩm trong kho`
      });
    }
    
    // Tìm hoặc tạo cart
    let cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
        status: 'active'
      });
    }
    
    // Kiểm tra item đã tồn tại chưa
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && 
      item.selectedColor.name === selectedColorObj.name && 
      item.selectedSize === selectedSize
    );
    
    if (existingItemIndex !== -1) {
      // Cập nhật số lượng nếu đã tồn tại
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Kiểm tra lại tồn kho
      if (newQuantity > availableStock) {
        return res.status(400).json({
          success: false,
          message: `Chỉ có thể thêm tối đa ${availableStock} sản phẩm (đã có ${cart.items[existingItemIndex].quantity} trong giỏ)`
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].priceAtAdd * newQuantity;
    } else {
      // Thêm item mới
      const priceAtAdd = product.discountPercentage > 0 
        ? product.price * (1 - product.discountPercentage / 100)
        : product.price;
      const newItem = {
        productId: productId,
        name: product.name,
        selectedColor: selectedColorObj,
        selectedSize,
        quantity,
        priceAtAdd: priceAtAdd,
        importPrice: product.importPrice,
        discountPercentage: product.discountPercentage,
        subtotal: priceAtAdd * quantity,
        images: selectedColorObj.images
      };
      cart.items.push(newItem);
    }
    
    await cart.save();
    
    // Populate product data để trả về
    await cart.populate('items.productId');
    
    res.status(200).json({
      success: true,
      message: 'Đã thêm vào giỏ hàng',
      data: cart
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm vào giỏ hàng',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (req, res) => {
  try {
    console.log("Update Cart Item Request:", req.body);
    const userId = req.user.id;
    const { itemId, quantity } = req.body;
    
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId');
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng không tồn tại'
      });
    }
    
    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại trong giỏ hàng'
      });
    }
    
    // Kiểm tra tồn kho
    const product = item.productId;
    const availableStock = product.stockQuantity;
    
    if (quantity > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${availableStock} sản phẩm trong kho`
      });
    }
    
    if (quantity <= 0) {
      // Xóa item nếu số lượng <= 0
      cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    } else {
      item.quantity = quantity;
      item.subtotal = item.priceAtAdd * quantity;
    }
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã cập nhật giỏ hàng',
      data: cart
    });
  } catch (error) {
    console.error("Update Cart Item Error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật giỏ hàng',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng không tồn tại'
      });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();
    
    await cart.populate('items.productId');
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi giỏ hàng',
      data: cart
    });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng',
      error: error.message
    });
  }
};

// Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Giỏ hàng không tồn tại'
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng',
      data: cart
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa giỏ hàng',
      error: error.message
    });
  }
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
