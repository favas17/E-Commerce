// Add event listener to the Place Order button
document.getElementById('placeOrder').addEventListener('click', async () => {
    try {
        const selectedPayment = document.querySelector('input[name="selectedPayment"]:checked').value;
        const selectedAddressId = document.getElementById('addressSelect').value;

        if (!selectedPayment || !selectedAddressId) {
            alert('Please select a payment method and address');
            return;
        }

        if (selectedPayment === 'onlineBanking') {
            await submitOnlineBanking(selectedAddressId);
        } else if (selectedPayment === 'COD') {
            await submitCOD(selectedAddressId);
        }
    } catch (error) {
        console.error(error);
        alert('Failed to place order. Please try again.');
    }
});



// Function to handle form submission for online banking
// Add event listener to the Place Order button
document.getElementById('placeOrder').addEventListener('click', async () => {
    try {
        const selectedPayment = document.querySelector('input[name="selectedPayment"]:checked').value;
        const selectedAddressId = document.getElementById('addressSelect').value;

        if (!selectedPayment || !selectedAddressId) {
            alert('Please select a payment method and address');
            return;
        }

        if (selectedPayment === 'onlineBanking') {
            await submitOnlineBanking(selectedAddressId);
        } else if (selectedPayment === 'COD') {
            await submitCOD(selectedAddressId);
        }
    } catch (error) {
        console.error(error);
        alert('Failed to place order. Please try again.');
    }
});


async function storeDetails(orderDetails, selectedAddressId) {
    try {
        const response = await fetch('/detailsStoring', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ orderDetails, selectedAddressId }),
        });

        if (!response.ok) {
            throw new Error('Network error');
        }

        console.log('Details submitted');
    } catch (error) {
        console.error(error);
    }
}


// Function to handle form submission for Cash On Delivery (COD)
async function submitCOD(selectedAddressId) {
    if (!selectedAddressId) {
        alert('Please select an address before proceeding.');
        return;
    }
    
    try {
        const response = await fetch('/createOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentMethod: 'COD', addressId: selectedAddressId })
        });

        if (!response.ok) {
            throw new Error('Network error');
        }

        const data = await response.json();
        
        // Redirect to OTP entering page
        window.location.href = `/orderOtp?orderId=${data.orderId}`;
    } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again.');
    }
}

// Add event listener to the Place Order button
// Client-side JavaScript for handling order placement
document.getElementById('placeOrder').addEventListener('click', async () => {
    try {
        const selectedPayment = document.querySelector('input[name="selectedPayment"]:checked').value;
        const selectedAddressId = document.getElementById('addressSelect').value;

        if (!selectedPayment || !selectedAddressId) {
            alert('Please select a payment method and address');
            return;
        }

        const response = await fetch('/placeOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ selectedPayment, selectedAddressId }),
        });

        if (!response.ok) {
            throw new Error('Network error');
        }

        const data = await response.json();

        if (data.message === 'COD') {
            // Redirect to COD OTP verification page
            window.location.href = '/orderOtp';
        } else if (data.orderId) {
            // Redirect to success page (replace with your actual success page)
            window.location.href = `/orderSuccess/${data.orderId}`;
        }
    } catch (error) {
        console.error(error);
        alert('Failed to place order. Please try again.');
    }
});

