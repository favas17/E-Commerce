    // Function to handle form submission for online banking

   async function submitOnlineBanking(selectedAddressId) {
    try {
        const response =  await fetch('/razorpayOrder',{
            method: 'POST',
            headers: {
                'Content-Type':'application/json'   
            },
            body:JSON.stringify({selectedAddressId})
        });

        if(response==500){
            alert('please select the address')
        }
        if(!response.ok){
            throw new Error('network error')
        }

        const data = await response.json();
        const razorpayOrders = data.razorpayOrderss;

        const options = {
            key: 'rzp_test_GxkKU3BnKyKe6Z',
            amount: razorpayOrders.amount,
            currency: razorpayOrders.currency,
            handler: async function(response) {
                // Handle payment success
                alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);

                await storeDetails(razorpayOrders,selectedAddressId);
            }
        };
        const razorpay = new Razorpay(options);
        razorpay.open();

        } catch (error) {
        console.error(error);
    }
};

async function storeDetails(orderDetails,selectedAddressId){
    try{
    const response = await fetch('/detailsStoring',{
        method:'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({orderDetails,selectedAddressId}),
    });

    if(!response.ok){
        throw new Error('network error')
    };

    console.log('details submited')

    }
    catch(error){
        console.error(error);
    }


}

// Function to handle form submission for Cash On Delivery (COD)
async function submitCOD() {
    try {
 
        // Your code to redirect to OTP entering page
        window.location.href = '/orderOtp';
         // Example URL for OTP entering page
    } catch (error) {
        console.error(error);
    }
}

// Add event listener to the Place Order button
document.getElementById('placeOrder').addEventListener('click', async function() {
    // Get the selected payment method
    const paymentMethod = document.querySelector('input[name="selectedPayment"]:checked').value;
    const selectedAddressId = document.getElementById("addressSelect").value;


    // Check the selected payment method and call the appropriate function
    if (paymentMethod === 'onlineBanking') {
        await submitOnlineBanking(selectedAddressId);
    } else if (paymentMethod === 'COD') {
        await submitCOD();
    }
});
