
function changeQuantity(productId, increment) {
    var inputElement = document.getElementById(productId);
    var currentValue = parseInt(inputElement.value);
    var newValue = currentValue + increment;
    var max = parseInt(inputElement.getAttribute("max"));

    if (newValue >= 1 && newValue <= max) {
        inputElement.value = newValue;

        if (newValue === max) {
            Swal.fire({
                icon: 'info',
                title: 'Product stock reached',
                text: 'The product stock is at its maximum.',
            });
        }

        fetch('/cartupdation', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                productId,
                count: increment,
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('totalvalue').textContent = `₹${data.totalSum}`;
            document.getElementById('displayTotal').textContent = data.totalSum;
        });
    }
}


$(document).ready(function () {
    $('.deleteItemButton').on('click', function () {
      var itemId = $(this).data('item-id');

      Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          $.ajax({
            url: `/removeCartItem/${itemId}`,
            method: 'DELETE',
            contentType: 'application/json',
            success: function (data) {
              console.log('Item deleted');
              location.reload();
            },
            error: function (error) {
              console.error('Failed to delete item', error);
            },
          });
        }
      });
    });
    
  });
