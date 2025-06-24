document.addEventListener('DOMContentLoaded', function() {
    
    // Fetch User Data
    function fetchUserData() {
        fetch('../handlers/get_user_data.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.customerName) {
                    document.getElementById('customerName').value = data.customerName;
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }

    // Fetch Artists
    function fetchArtists() {
        fetch('../handlers/get_artists.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const artistSelect = document.getElementById('artistSelection');
                    data.artists.forEach(artist => {
                        const option = document.createElement('option');
                        option.value = artist.artist_id;
                        option.textContent = artist.artist_name;
                        artistSelect.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching artists:', error);
            });
    }

 // Create animated stars
        function createStars() {
            const starsContainer = document.getElementById('stars');
            for (let i = 0; i < 100; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 3 + 's';
                starsContainer.appendChild(star);
            }
        }

        // Load cart from localStorage and display order summary
        function loadOrderSummary() {
            const cartItems = JSON.parse(localStorage.getItem('cakeCart')) || [];
            const orderSummary = document.getElementById('orderSummary');
            let html = '';
            let total = 0;

            if (cartItems.length === 0) {
                html = '<p>No items in your order. Please go back to customize your cake.</p>';
            } else {
                cartItems.forEach(item => {
                    html += `
                        <div class="order-item">
                            <div>${item.name}</div>
                            <div>₪${item.price} </div>
                        </div>
                    `;
                    total += item.price;
                });

                html += `
                    <div class="order-total order-item">
                        <div>Total</div>
                        <div>₪${total} </div>
                    </div>
                `;

                // Check if any item has matcha flavor or layer
                const hasMatcha = cartItems.some(item => 
                    item.options.flavor === 'matcha' || 
                    item.options.layers.includes('matcha')
                );

                // Disable matcha lover promo if no matcha items
                if (!hasMatcha) {
                    document.getElementById('matchaLoverBtn').disabled = true;
                    document.getElementById('matchaLoverBtn').style.opacity = '0.5';
                    document.getElementById('matchaLoverBtn').style.cursor = 'not-allowed';
                }
            }

            orderSummary.innerHTML = html;
        }

        // Setup promo code buttons for multi-selection
        function setupPromoButtons() {
            const promoButtons = document.querySelectorAll('.promo-btn:not([disabled])');
            const promoCodeInput = document.getElementById('promoCode');
            let selectedPromos = [];

            promoButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const promoCode = button.dataset.code;
                    
                    // Toggle selection
                    if (button.classList.contains('selected')) {
                        // Remove from selected
                        button.classList.remove('selected');
                        selectedPromos = selectedPromos.filter(code => code !== promoCode);
                        
                        // Re-enable all buttons when below limit
                        if (selectedPromos.length < 2) {
                            promoButtons.forEach(btn => {
                                btn.classList.remove('limit-reached');
                            });
                        }
                    } else {
                        // Check if we can add another (max 2)
                        if (selectedPromos.length < 2) {
                            button.classList.add('selected');
                            selectedPromos.push(promoCode);
                            
                            // If we've reached the limit, disable non-selected buttons
                            if (selectedPromos.length === 2) {
                                promoButtons.forEach(btn => {
                                    if (!btn.classList.contains('selected')) {
                                        btn.classList.add('limit-reached');
                                    }
                                });
                            }
                        } else {
                            // Visual feedback for reaching limit
                            button.classList.add('limit-reached');
                            setTimeout(() => {
                                button.classList.remove('limit-reached');
                            }, 300);
                        }
                    }
                    
                    // Update hidden input value
                    promoCodeInput.value = selectedPromos.join(',');
                });
            });
        }

        // Handle form submission
        function setupFormSubmission() {
            const form = document.getElementById('deliveryForm');
            
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // 1. Get delivery details from the form
                const deliveryDetails = {
                    name: document.getElementById('customerName').value,
                    address: document.getElementById('deliveryAddress').value,
                    deliveryType: document.querySelector('input[name="deliveryType"]:checked').value,
                    paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
                    promoCode: document.getElementById('promoCode').value,
                    feedback: document.getElementById('customerFeedback').value
                };

                // 2. Get cart items from localStorage
                const cartItems = JSON.parse(localStorage.getItem('cakeCart')) || [];

                if (cartItems.length === 0) {
                    alert('Your cart is empty!');
                    return;
                }

                // 3. Combine into a single payload
                const orderPayload = {
                    cartItems: cartItems,
                    deliveryDetails: deliveryDetails
                };

                // 4. Send to the backend
                fetch('../handlers/submit_order.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderPayload),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const detailsContainer = document.getElementById('orderDetails');
                        const deliveryTimeEl = document.getElementById('deliveryTime');

                        // 1. Create a more detailed order summary
                        let summaryHtml = '<h4>Your Cosmic Treats:</h4><ul>';
                        cartItems.forEach(item => {
                            const toppingsList = item.options.toppings.length > 0
                                ? `<span>Toppings: ${item.options.toppings.join(', ')}</span>`
                                : '';

                            summaryHtml += `
                                <li class="order-detail-item">
                                    <strong>${item.name} - ₪${item.price}</strong>
                                    <div class="cake-details-summary">
                                        <span>Design: ${item.options.design}</span>
                                        <span>Flavor: ${item.options.flavor}</span>
                                        <span>Layers: ${item.options.layerCount}</span>
                                        ${toppingsList}
                                    </div>
                                </li>
                            `;
                        });
                        summaryHtml += '</ul>';
                        detailsContainer.innerHTML = summaryHtml;
                        
                        // 2. Set delivery estimate
                        const deliveryType = document.querySelector('input[name="deliveryType"]:checked').value;
                        deliveryTimeEl.textContent = deliveryType === 'lunar' ? '2-3 Earth days' : '1 Earth day';

                        // 3. Show the modal
                        document.getElementById('confirmationModal').style.display = 'block';

                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An unexpected error occurred while submitting your order.');
                });
            });
        }

        function setupModalControls() {
            const modal = document.getElementById('confirmationModal');
            const closeModalBtn = modal.querySelector('.close-modal');
            const confirmBtn = modal.querySelector('.confirm-btn');

            const closeModal = () => {
                modal.style.display = 'none';
                localStorage.removeItem('cakeCart'); // Clear cart
                window.location.reload(); // Refresh the page
            };

            closeModalBtn.addEventListener('click', closeModal);
            confirmBtn.addEventListener('click', closeModal);
        }

        // Initialize the page
        function init() {
            createStars();
            loadOrderSummary();
            setupPromoButtons();
            setupFormSubmission();
            setupModalControls();
            fetchUserData();
        }

    init();
});