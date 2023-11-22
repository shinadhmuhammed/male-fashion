document.addEventListener('DOMContentLoaded', function () {
    const addToCartButtons = document.querySelectorAll('.add-cart');
    const categoryLinks = document.querySelectorAll(".category-link");
    const sortSelect = document.getElementById('sortSelect');
    const sortButton = document.getElementById('sortButton'); 
    const productsContainer = document.getElementById("products-container");

        addToCartButtons.forEach(button => {
            button.addEventListener('click', async function () {
                const productId = button.getAttribute('data-product-id');
                const userId = button.getAttribute('data-user-id');

                if (!userId || !productId) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'User or product information is missing.'
                    });
                    return;
                }

                try {
                    const response = await fetch(`/shoppingcart/${productId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.message === 'Product added to the cart successfully.') {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'Product added to the cart successfully.'
                            });
                        } else if (result.message === 'Product is already in the cart.') {
                            Swal.fire({
                                icon: 'info',
                                title: 'Info',
                                text: 'Product is already in the cart.'
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Failed to add the product to the cart.'
                            });
                        }
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to communicate with the server.'
                        });
                    }
                } catch (error) {
                    console.error('An error occurred:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred. Please try again.'
                    });
                }
            });
        });

        categoryLinks.forEach(link => {
        link.addEventListener("click", async function (event) {
            event.preventDefault();
            const selectedCategory = this.getAttribute("data-category");

            try {
                const response = await fetch(`/categorySelection/${selectedCategory}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const categoryDetails = await response.json();
                renderProducts(categoryDetails.products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        });
    });



    sortButton.addEventListener('click', function () { 
        const selectedOption = sortSelect.value;
        console.log('Selected Option:', selectedOption);
        fetchAndRenderSortedProducts(selectedOption);
    });

    sortSelect.addEventListener('change', function () {
        const selectedOption = sortSelect.value;
        console.log('Selected Option:', selectedOption);
    });




    async function fetchAndRenderSortedProducts(option) {
    try {
        const url = `/sortProducts?option=${option}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const sortedProducts = await response.json();
        console.log('Sorted Products:', sortedProducts);
        renderProducts(sortedProducts);

        history.pushState({ option }, null, url);
    } catch (error) {
        console.error('Error fetching and displaying sorted products:', error);
    }
}



    function renderProducts(products) {
        productsContainer.innerHTML = '';

        products.forEach(product => {
            const productElement = createProductElement(product);
            productsContainer.appendChild(productElement);
        });
    }



    

    function createProductElement(product) {
        const productElement = document.createElement("div");
        productElement.className = "col-lg-4 col-md-6 col-sm-6";

        productElement.innerHTML = `
        <div class="product__item">
            <div class="product" data-product-id="${product.product_id}">
                <a href="#">
                    <img src="/malefashion-master/images/${product.productImage[0].filename}" alt="${product.productName}">
                    <ul class="product__hover">
                        <li><a href="./shopdetails?id=${product._id}"><img src="/malefashion-master/images/search.png" alt=""></a></li>
                    </ul>
                </div>
            </a>
        </div>
        <div class="product__item__text">
            <h6>${product.productName}</h6>
            <div class="rating">
                <i class="fa fa-star-o"></i>
                <i class="fa fa-star-o"></i>
                <i class="fa fa-star-o"></i>
                <i class="fa fa-star-o"></i>
                <i class="fa fa-star-o"></i>
            </div>
            <h5>₹${product.productPrice}</h5>
            <div class="product__color__select">
            </div>
        </div>
    </div>
    `;
        return productElement;
    }
});







document.addEventListener('DOMContentLoaded', function () {
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');

    wishlistButtons.forEach(button => {
        button.addEventListener('click', async function () {
            const productId = button.getAttribute('data-product-id');

            if (!productId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Product information is missing.'
                });
                return;
            }

            try {
                const response = await fetch(`/wishlist/${productId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                       
                    }),
                });

                if (response.ok) {
                    console.log('Product added to wishlist successfully');
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Product added to the wishlist successfully.'
                    });
                } else {
                    console.error('Failed to add product to wishlist');
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to add the product to the wishlist.'
                    });
                }
            } catch (error) {
                console.error('An error occurred:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred. Please try again.'
                });
            }
        });
    });
});
