import Cart from '../../models/cart/Cart.js';
import Product from '../../models/product/Product.js';

// Lấy giỏ hàng của user
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findOne({ userId: userId }).populate({
      path: 'items.productId',
      populate: {
        path: 'brand',
        model: 'Brand'
      }
    });
    
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
    if (!product.sizes.includes(selectedSize.size)) {
    // Extract size from selectedSize (could be string or object)
    let sizeValue = selectedSize;
    if (typeof selectedSize === 'object' && selectedSize.size) {
      sizeValue = selectedSize.size;
    }
    console.log("Size value:", sizeValue);
    console.log("Selected color sizes:", selectedColorObj.sizes);
    
    // Tìm size variant trong color đã chọn để lấy quantity cụ thể
    const sizeVariant = selectedColorObj.sizes.find(s => s.size === sizeValue);
    if (!sizeVariant) {
      return res.status(400).json({
        success: false,
        message: 'Kích thước không hợp lệ hoặc không có trong màu đã chọn'
      });
    }
    
    const availableStock = sizeVariant.quantity;
    console.log("Available stock for this color/size:", availableStock);
    
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
      item.selectedSize === sizeValue
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
      
      // Use the first image from the selected color
      const images = selectedColorObj.images && selectedColorObj.images.length > 0 
        ? selectedColorObj.images 
        : product.images;
      
      const newItem = {
        productId: productId,
        name: product.name,
        selectedColor: selectedColorObj,
        selectedSize: sizeValue,
        quantity,
        priceAtAdd: priceAtAdd,
        importPrice: product.importPrice,
        discountPercentage: product.discountPercentage,
        subtotal: priceAtAdd * quantity,
        images: images,
        availableStock: availableStock // Lưu số lượng có sẵn để validate sau này
      };
      cart.items.push(newItem);
    }
    
    await cart.save();
    
    // Populate product data để trả về
    await cart.populate({
      path: 'items.productId',
      populate: {
        path: 'brand',
        model: 'Brand'
      }
    });
    
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
    
    const cart = await Cart.findOne({ userId: userId });
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
    
    // Populate từ Cart model vì item là subdocument
    await cart.populate({
      path: 'items.productId',
      populate: {
        path: 'brand',
        model: 'Brand'
      }
    });
    
    // Get the populated item
    const populatedItem = cart.items.find(item => item._id.toString() === itemId);
    
    console.log("Cart item:", populatedItem);
    console.log("SelectedColor in item:", populatedItem.selectedColor);
    
    // Lấy product và kiểm tra tồn kho theo color/size cụ thể
    const product = populatedItem.productId;
    
    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }
    
    // Lấy tên màu từ selectedColor (có thể là object hoặc object có name)
    const colorName = typeof populatedItem.selectedColor === 'string' 
      ? populatedItem.selectedColor 
      : (populatedItem.selectedColor?.name || populatedItem.selectedColor);
    
    console.log("Color name:", colorName);
    
    // Tìm color trong product
    const colorIndex = product.colors.findIndex(c => c.name === colorName);
    if (colorIndex === -1 || !product.colors[colorIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Màu sắc không hợp lệ'
      });
    }
    
    const selectedColorObj = product.colors[colorIndex];
    
    // Tìm size variant để lấy quantity cụ thể
    const sizeVariant = selectedColorObj.sizes.find(s => s.size === populatedItem.selectedSize);
    if (!sizeVariant) {
      return res.status(400).json({
        success: false,
        message: 'Kích thước không hợp lệ'
      });
    }
    
    const availableStock = sizeVariant.quantity;
    console.log("Available stock for this color/size:", availableStock);
    
    if (quantity > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${availableStock} sản phẩm trong kho cho màu này và size này`
      });
    }
    
    // Update the actual item in the array
    const itemToUpdate = cart.items.find(item => item._id.toString() === itemId);
    
    if (quantity <= 0) {
      // Xóa item nếu số lượng <= 0
      cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    } else {
      itemToUpdate.quantity = quantity;
      itemToUpdate.subtotal = itemToUpdate.priceAtAdd * quantity;
      itemToUpdate.availableStock = availableStock; // Cập nhật availableStock
    }
    
    await cart.save();
    
    // Repopulate after save to include updated data
    await cart.populate({
      path: 'items.productId',
      populate: {
        path: 'brand',
        model: 'Brand'
      }
    });
    
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
    
    await cart.populate({
      path: 'items.productId',
      populate: {
        path: 'brand',
        model: 'Brand'
      }
    });
    
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
