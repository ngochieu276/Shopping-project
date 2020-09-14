const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
let cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productDOM = document.querySelector(".products-center");

let cart = [];
let buttonDOM = [];
//getting products
class Product {
  async getProduct() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let product = data.items;
      product = product.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return product;
    } catch (error) {
      console.log(error);
    }
  }
}

//display products
class UI {
  displayProduct(products) {
    var result = "";
    products.forEach(function (product) {
      result += `
        <article class="product">
          <div class="img-container">
            <img src=${product.image} class="product-img" />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping cart"></i>
              Add to bag
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>`;
    });
    productDOM.innerHTML = result;
  }
  getBagButton() {
    let buttons = [...document.querySelectorAll(".bag-btn")];
    buttonDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      } else {
        button.addEventListener("click", (event) => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          //get product from products
          let cartItem = { ...Storage.getProducts(id), amount: 1 };
          //add product to the cart
          cart = [...cart, cartItem];
          console.log(cart);
          //save cart to the local storage
          Storage.saveCart(cart);
          //set cart value
          this.setcartValues(cart);
          //display the cart-item
          this.displayCartItem(cartItem);
          //show cart
          this.showCart(cart);
        });
      }
    });
  }

  setcartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartItems.innerText = itemsTotal;
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
  }

  displayCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src=${item.image} />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
    cartContent.appendChild(div);
  }

  showCart(cart) {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    let cart = Storage.getCart();
    this.setcartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.displayCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    // clear button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //cart function
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        this.setcartValues(cart);
        Storage.saveCart(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          this.setcartValues(cart);
          Storage.saveCart(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setcartValues(cart);
    Storage.saveCart(cart);

    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to bag`;
  }

  getSingleButton(id) {
    return buttonDOM.find((item) => item.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveProducts(product) {
    localStorage.setItem("product", JSON.stringify(product));
  }

  static getProducts(id) {
    let product = JSON.parse(localStorage.getItem("product"));
    return product.find((product) => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const product = new Product();
  const ui = new UI();
  ui.setupAPP();
  product
    .getProduct()
    .then((products) => {
      ui.displayProduct(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButton();
      ui.cartLogic();
    });
});
