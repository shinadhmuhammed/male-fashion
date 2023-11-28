async function togglePaymentMethod(element) {
    var placeOrderButton = document.getElementById("placeOrderButton");

    if (element.checked) {
        placeOrderButton.removeAttribute("disabled");
    } else {
        placeOrderButton.setAttribute("disabled", "disabled");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const selectedAddressRadioButtons = document.getElementsByName("selectedAddress");
    const selectedAddressIdInput = document.getElementById("selectedAddressId");

    for (let i = 0; i < selectedAddressRadioButtons.length; i++) {
        selectedAddressRadioButtons[i].addEventListener("change", function () {
            if (this.checked) {
                selectedAddressIdInput.value = this.value;
            }
        });
    }
});



async function CheckplaceOrder() {
    const selectedAddressId = document.getElementById("selectedAddressId").value;

    if (selectedAddressId === "") {
        Swal.fire({
            text: "Please select an address!",
            icon: "error",
            showConfirmButton: false,
            timer: 1000,
        });
        return;
    }

    const paymentMethodRadio = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethodRadio) {
        Swal.fire({
            text: "Please select a payment method!",
            icon: "error",
            showConfirmButton: false,
            timer: 1000,
        });
        return;
    }

    const paymentMethod = paymentMethodRadio.value;

const couponCode = document.getElementById('couponCode').value;

try {
    if (paymentMethod === 'COD') {
        await handleCashOnDelivery(selectedAddressId, paymentMethod);
    } else if (paymentMethod === 'Razorpay') {
        const totalAmountResponse = await fetch('/getTotalAmount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selectedAddressId,
            }),
        });

        if (!totalAmountResponse.ok) {
            throw new Error(`Failed to fetch total amount. Status: ${totalAmountResponse.status}`);
        }

        const totalAmountData = await totalAmountResponse.json();
        let amount = totalAmountData.totalAmount;

        const discountDetails = {
            offerPrice: parseFloat(document.getElementById('offerPrice').textContent.replace('₹', '')),
            discountPrice: parseFloat(document.getElementById('discountPrice').textContent.replace('₹', '')),
        };

        if (discountDetails.discountPrice > 0) {
            amount -= discountDetails.discountPrice;
        }

        const razorpayOrderResponse = await fetch('/razorpayorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount,
                selectedAddressId,
                paymentMethod,
                couponCode,
            }),
        });

        if (!razorpayOrderResponse.ok) {
            throw new Error(`Failed to fetch Razorpay order. Status: ${razorpayOrderResponse.status}`);
        }

        const razorpayOrderData = await razorpayOrderResponse.json();
        const { orderId, razorpayOrder } = razorpayOrderData;

        await handleRazorpay(amount, orderId, selectedAddressId, paymentMethod, razorpayOrder);
    } else if (paymentMethod === 'Wallet') {
        
        await handleWalletPayment(selectedAddressId, couponCode);
    }
} catch (error) {
    console.error(error);
    Swal.fire({
        text: 'Error processing the order!',
        icon: 'error',
        showConfirmButton: false,
        timer: 1000,
    });
}
}




async function handleCashOnDelivery(selectedAddressId, paymentMethod) {
    try {
        const response = await fetch('/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selectedAddressId,
                paymentMethod,  
            }),
        });

        if (response.status === 200) {
            Swal.fire({
                text: "Order placed successfully!",
                icon: 'success',
                showConfirmButton: false,
                timer: 2000,
            });

            setTimeout(()=>{
            window.location.href='/myorder'
        },2000)

        } else {
            Swal.fire({
                text: "Failed to place the order!",
                icon: 'error',
                showConfirmButton: false,
                timer: 1000,
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            text: "Error placing the order!",
            icon: 'error',
            showConfirmButton: false,
            timer: 1000,
        });
    }
}

async function loadRazorpayScript() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        document.head.appendChild(script);
    });
}



async function handleRazorpayOrder(selectedAddressId, paymentMethod, razorpayOrder, originalAmount) {
    try {
        const response = await fetch('/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selectedAddressId,
                paymentMethod,
                razorpayOrder,
                originalAmount, 
            }),
        });

        if (response.status === 200) {
            Swal.fire({
                text: "Order placed successfully!",
                icon: 'success',
                showConfirmButton: false,
                timer: 1000,
            });
            setTimeout(()=>{
                window.location.href='/myorder'
            },2000)
            
        } else {
            Swal.fire({
                text: "Failed to place the order!",
                icon: 'error',
                showConfirmButton: false,
                timer: 1000,
            });
        }
    } catch (error) {
        console.error(error);
        Swal.fire({
            text: "Error placing the order!",
            icon: 'error',
            showConfirmButton: false,
            timer: 1000,
        });
    }
}



async function handleRazorpay(amount, orderId, selectedAddressId, paymentMethod, razorpayOrder) {
    try {
        await loadRazorpayScript();

        const options = {
            key: "rzp_test_0UjhmVyB7i2e6b",
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: 'Male Fashion',
            description: 'Purchase from our online store',
            order_id: orderId,
            handler: function (response) {
                console.log(response);

                handleRazorpayOrder(selectedAddressId, paymentMethod, razorpayOrder, amount);
            },
            prefill: {
                name: 'Customer Name',
                email: 'customer@example.com',
                contact: '1234567890',
            },
            theme: {
                color: '#3399cc',
            },
        };

        const razorpay = new Razorpay(options);
        razorpay.open();
    } catch (error) {
        console.error('Error in handleRazorpay function:', error);
        Swal.fire({
            text: 'Error with Razorpay payment!',
            icon: 'error',
            showConfirmButton: false,
            timer: 1000,
        });
    }
}




async function handleWalletPayment(selectedAddressId, couponCode) {
    try {
        const walletOrderResponse = await fetch('/walletorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selectedAddressId: selectedAddressId,
                couponCode: couponCode,
            }),
        });

        if (!walletOrderResponse.ok) {
            const errorResponse = await walletOrderResponse.json();
            if (errorResponse.error === 'Insufficient wallet balance') {
                throw new Error('Insufficient wallet balance. Please add funds to your wallet.');
            }
            throw new Error(`Failed to process wallet payment. Status: ₹{walletOrderResponse.status}, Error: ₹{errorResponse.error}`);
        }

        const result = await walletOrderResponse.json();

        Swal.fire({
            text: result.message || 'Order placed successfully using wallet!',
            icon: 'success',
            showConfirmButton: false,
            timer: 1000,
        });
    } catch (error) {
        console.error(error);
        Swal.fire({
            text: error.message || 'Error processing wallet payment!',
            icon: 'error',
            showConfirmButton: false,
            timer: 1000,
        });
    }
}






function calculateOfferPrice(originalPrice, discountPrice) {
    return originalPrice - discountPrice;
}

// function calculateDiscountAmount(originalPrice, discountPercentage) {
//     const discountAmount = (originalPrice * discountPercentage) / 100;
//     return discountAmount.toFixed(2);
// }

document.getElementById('couponForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const couponCode = document.getElementById('couponCode').value;

    fetch('/coupon-validate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ couponCode }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Coupon validation response:', data);

        if (data.valid) {
            const offerPrice = calculateOfferPrice(data.totalSum, data.coupon.discountPrice);
            const discountPrice = data.coupon.discountPrice;

            document.getElementById('offerPrice').textContent = `₹${offerPrice}`;
            document.getElementById('discountPrice').textContent = `₹${discountPrice}`;

            const totalWithDiscount = data.totalSum - discountPrice;
            document.getElementById('totalvalue').textContent = `₹${totalWithDiscount}`;
            document.getElementById('discountDetails').style.display = 'block';

    
            Swal.fire({
                icon: 'success',
                title: 'Coupon Validated',
                text: 'Your coupon has been successfully applied!',
            });
        } else {
            document.getElementById('offerPrice').textContent = '';
            document.getElementById('discountPrice').textContent = '';
            
            if (data.totalSum !== undefined) {
                document.getElementById('totalvalue').textContent = `₹${data.totalSum}`;
            }


            Swal.fire({
                icon: 'error',
                title: 'Invalid Coupon',
                text: data.message ? data.message : 'Invalid coupon code. Please try again.',
            });
        }
    })
    .catch(error => {
        console.error('Error applying coupon:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while applying the coupon. Please try again later.',
        });
    });
});










$(document).ready(function() {
    $(document).on('click', '#showAddressBtn', function() {
        $('#addressForm').toggle(); 
    });
});


document.addEventListener("DOMContentLoaded", function () {
    var showAddressBtn = document.getElementById("showAddressBtn");
    var addressForm = document.getElementById("addressForm");

    addressForm.style.display = "none"; 

    showAddressBtn.addEventListener("click", function () {
        if (addressForm.style.display === "none") {
            addressForm.style.display = "block";
        } else {
            addressForm.style.display = "none";
        }
    });
});



