function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(counr)+1
                $("#cart-count").html(count)
            }
            alert(response)
        }
    })
}
