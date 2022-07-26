function addToCart(proId) {   //Helps to add items to cart without refreshing the page
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
            }
            alert("Item added to cart")     //shows alert when a prduct is added to cart
        }
    })
}
