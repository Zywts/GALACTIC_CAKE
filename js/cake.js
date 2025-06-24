// Cake customization options
        const cakeOptions = {
            design: null,
            flavor: null,
            layerCount: null,
            layers: [],
            toppings: [],
            artistId: null,
            currentLayerEditing: 1 // Track which layer we're currently editing
        };

        // Pricing information
        const basePrice = 500; // Base price for cake design
        const priceAdjustments = {
            design: {
                galactic: 0, // All designs cost ₱500 (included in base price)
                meteor: 0,
                nebula: 0
            },
            flavor: {
                chocolate: 0, // No additional cost for flavor
                'red velvet': 0,
                matcha: 0
            },
            layerCount: {
                1: 0, // First layer is included in base
                2: 100, // Each additional layer costs ₱100
                3: 200
            },
            layers: {
                'choco sponge': 100, // Each layer composition costs ₱100
                'vanilla cream': 100,
                'red velvet': 100,
                'raspberry jam': 100,
                'matcha': 100,
                'cream cheese': 100,
                'choco chips': 100
            },
            toppings: {
                sprinkles: 50, // Each topping costs ₱50
                'rocket candy': 50,
                nuts: 50
            }
        };

        // Flavor to default layer mapping
        const flavorToLayer = {
            'chocolate': 'choco sponge',
            'red velvet': 'red velvet',
            'matcha': 'matcha'
        };

        // Cart items
        let cartItems = [];

        // Initialize the page
        function init() {
            createStars();
            setupOptionButtons();
            setupModalButtons();
            updatePreview();
            setupLogoutButton();
            setupCartButton();
            fetchArtists();
        }

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

        function setupLogoutButton() {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Here you could also make a call to a backend script to destroy the session
                    window.location.href = 'cake_login.html';
                });
            }
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

        // Setup option buttons
        function setupOptionButtons() {
            // Design options
            document.querySelectorAll('#designOptions .option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    cakeOptions.design = btn.dataset.value;
                    updateOptionSelection('#designOptions', btn);
                    updatePreview();
                });
            });

            // Flavor options
            document.querySelectorAll('#flavorOptions .option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    cakeOptions.flavor = btn.dataset.value;
                    updateOptionSelection('#flavorOptions', btn);
                    
                    // Automatically set first layer based on flavor
                    if (cakeOptions.layerCount) {
                        updateLayersBasedOnFlavor();
                    }
                    
                    updatePreview();
                });
            });

            // Layer count options
            document.querySelectorAll('#layerCountOptions .option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const newLayerCount = parseInt(btn.dataset.value);
                    cakeOptions.layerCount = newLayerCount;
                    
                    // Update layers array based on new count
                    if (cakeOptions.flavor) {
                        updateLayersBasedOnFlavor();
                    }
                    
                    updateOptionSelection('#layerCountOptions', btn);
                    updatePreview();
                });
            });

            // Layer options
            document.querySelectorAll('#layerOptions .option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (cakeOptions.layerCount === null || !cakeOptions.flavor) {
                        return;
                    }
                    
                    // For 1 layer, don't allow changes
                    if (cakeOptions.layerCount === 1) return;
                    
                    // Get the selected layer value
                    const selectedLayerValue = btn.dataset.value;
                    
                    // Update the current layer we're editing
                    cakeOptions.layers[cakeOptions.currentLayerEditing] = selectedLayerValue;
                    
                    // Move to next layer if available
                    if (cakeOptions.currentLayerEditing < cakeOptions.layerCount - 1) {
                        cakeOptions.currentLayerEditing++;
                    } else {
                        // If we've edited all layers, reset to first editable layer (index 1)
                        cakeOptions.currentLayerEditing = 1;
                    }
                    
                    updateLayerSelections();
                    updatePreview();
                });
            });

            // Topping options
            document.querySelectorAll('#toppingOptions .option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const toppingValue = btn.dataset.value;
                    const index = cakeOptions.toppings.indexOf(toppingValue);
                    
                    if (index === -1) {
                        cakeOptions.toppings.push(toppingValue);
                        btn.classList.add('selected');
                    } else {
                        cakeOptions.toppings.splice(index, 1);
                        btn.classList.remove('selected');
                    }
                    
                    updatePreview();
                });
            });

            document.getElementById('artistSelection').addEventListener('change', (e) => {
                cakeOptions.artistId = e.target.value;
                updatePreview();
            });

            // Add to cart button
            document.getElementById('addToCartBtn').addEventListener('click', addToCart);
        }

        // Update layers based on current flavor and layer count
        function updateLayersBasedOnFlavor() {
            if (!cakeOptions.flavor || !cakeOptions.layerCount) return;
            
            const defaultLayer = flavorToLayer[cakeOptions.flavor];
            
            // Initialize layers array with default flavor for first layer
            cakeOptions.layers = [defaultLayer];
            
            // For additional layers, set to default initially but allow customization
            for (let i = 1; i < cakeOptions.layerCount; i++) {
                cakeOptions.layers.push(defaultLayer);
            }
            
            // Reset layer editing to first customizable layer (index 1)
            cakeOptions.currentLayerEditing = 1;
            
            updateLayerSelections();
        }

        // Update layer selection buttons
        function updateLayerSelections() {
            const layerButtons = document.querySelectorAll('#layerOptions .option-btn');
            
            // Clear all selections first
            layerButtons.forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Mark selected layers
            cakeOptions.layers.forEach(layer => {
                layerButtons.forEach(btn => {
                    if (btn.dataset.value === layer) {
                        btn.classList.add('selected');
                    }
                });
            });
        }

        // Setup modal buttons
        function setupModalButtons() {
            // Close modal button
            document.getElementById('closeModal').addEventListener('click', () => {
                document.getElementById('checkoutModal').classList.remove('active');
            });

            // Cancel checkout button
            document.getElementById('cancelCheckout').addEventListener('click', () => {
                document.getElementById('checkoutModal').classList.remove('active');
            });

            // Proceed to delivery button
            document.getElementById('proceedToDelivery').addEventListener('click', () => {
                // Save cart to localStorage before redirecting
                localStorage.setItem('cakeCart', JSON.stringify(cartItems));
                window.location.href = 'delivery_cake.html';
            });
        }

        // Update option selection styling
        function updateOptionSelection(containerSelector, selectedBtn) {
            document.querySelectorAll(`${containerSelector} .option-btn`).forEach(btn => {
                btn.classList.remove('selected');
            });
            selectedBtn.classList.add('selected');
        }

        // Update the preview panel
        function updatePreview() {
            // Update cake name
            let cakeName = "CakeVerse";
            if (cakeOptions.design && cakeOptions.flavor) {
                cakeName = `${capitalizeFirstLetter(cakeOptions.design)} ${capitalizeFirstLetter(cakeOptions.flavor)} Cake`;
            }
            document.getElementById('cakeName').textContent = cakeName;
            
            // Update customization display
            const displayElement = document.getElementById('customizationDisplay');
            let html = '';
            
            if (cakeOptions.design) {
                html += `<div class="customization-item">
                    <span class="customization-label">Design:</span>
                    <span class="customization-value">${capitalizeFirstLetter(cakeOptions.design)}</span>
                </div>`;
            }
            
            if (cakeOptions.flavor) {
                html += `<div class="customization-item">
                    <span class="customization-label">Flavor:</span>
                    <span class="customization-value">${capitalizeFirstLetter(cakeOptions.flavor)}</span>
                </div>`;
            }
            
            if (cakeOptions.layerCount) {
                html += `<div class="customization-item">
                    <span class="customization-label">Layers:</span>
                    <span class="customization-value">${cakeOptions.layerCount}</span>
                </div>`;
                
                if (cakeOptions.layers.length > 0) {
                    html += `<div class="customization-item">
                        <span class="customization-label">Layer Composition:</span>
                        <span class="customization-value">`;
                    
                    // Show first layer as auto-set by flavor
                    html += `Layer 1: ${capitalizeFirstLetter(cakeOptions.layers[0])} (Auto-Set By Flavor)`;
                    
                    // Show additional layers if they exist
                    for (let i = 1; i < cakeOptions.layers.length; i++) {
                        html += `<br>Layer ${i+1}: ${capitalizeFirstLetter(cakeOptions.layers[i])}`;
                    }
                    
                    html += `</span></div>`;
                }
            }
            
            if (cakeOptions.toppings.length > 0) {
                const capitalizedToppings = cakeOptions.toppings.map(topping => 
                    topping.split(' ').map(word => capitalizeFirstLetter(word)).join(' ')
                );
                html += `<div class="customization-item">
                    <span class="customization-label">Toppings:</span>
                    <span class="customization-value">${capitalizedToppings.join(', ')}</span>
                </div>`;
            }
            
            displayElement.innerHTML = html;
            
            // Update price
            updatePrice();
            
            // Enable/disable add to cart button
            document.getElementById('addToCartBtn').disabled = !isCakeComplete();
        }

        // Helper function to capitalize first letter of each word
        function capitalizeFirstLetter(str) {
            return str.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }

        // Calculate and update price
        function updatePrice() {
            let price = basePrice;
            
            if (cakeOptions.design) {
                price += priceAdjustments.design[cakeOptions.design];
            }
            
            if (cakeOptions.flavor) {
                price += priceAdjustments.flavor[cakeOptions.flavor];
            }
            
            if (cakeOptions.layerCount) {
                price += priceAdjustments.layerCount[cakeOptions.layerCount];
            }
            
            cakeOptions.layers.forEach(layer => {
                price += priceAdjustments.layers[layer];
            });
            
            cakeOptions.toppings.forEach(topping => {
                price += priceAdjustments.toppings[topping];
            });
            
            document.getElementById('cakePrice').textContent = `₪${price}`;
            return price;
        }

        // Check if cake is complete
        function isCakeComplete() {
            return cakeOptions.design && 
                   cakeOptions.flavor && 
                   cakeOptions.layerCount && 
                   cakeOptions.layers.length === cakeOptions.layerCount &&
                   cakeOptions.artistId;
        }

        // Show notification
        function showNotification(message) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Add to cart function
        function addToCart() {
            if (!isCakeComplete()) {
                alert("Please complete your cake customization before adding to cart.");
                return;
            }
        
            // Prepare data for the backend
            const cakeData = {
                design: cakeOptions.design,
                layerCount: cakeOptions.layerCount,
                toppings: cakeOptions.toppings,
                layers_type: cakeOptions.layers.join(', '), // Sending full composition for context
                artistId: cakeOptions.artistId
            };
        
            // Use fetch to send data to the new PHP script
            fetch('../handlers/save_cake.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cakeData),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // If the cake was saved successfully, add it to the local cart
                    const price = updatePrice();
                    const cakeName = document.getElementById('cakeName').textContent;
                    
                    cartItems.push({
                        cakeId: data.cakeId, // Store the ID from the database
                        name: cakeName,
                        price: price,
                        options: {...cakeOptions}
                    });
                    
                    updateCartCount();
                    showNotification(`${cakeName} added to cart!`);
                    showCartModal();
                    resetCakeOptions();

                } else {
                    // If it failed, show an error message
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An unexpected error occurred while saving your cake.');
            });
        }

        // Show cart modal
        function showCartModal() {
            const cartItemsElement = document.getElementById('cartItems');
            let html = '';
            let total = 0;
            
            cartItems.forEach(item => {
                html += `<div class="cart-item">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₪${item.price}</div>
                </div>`;
                total += item.price;
            });
            
            cartItemsElement.innerHTML = html;
            document.getElementById('cartTotal').textContent = `Total: ₪${total}`;
            document.getElementById('checkoutModal').classList.add('active');
        }

        // Reset cake options
        function resetCakeOptions() {
            cakeOptions.design = null;
            cakeOptions.flavor = null;
            cakeOptions.layerCount = null;
            cakeOptions.layers = [];
            cakeOptions.toppings = [];
            cakeOptions.artistId = null;
            cakeOptions.currentLayerEditing = 1;
            
            document.querySelectorAll('.option-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            updatePreview();
        }

        // Add this new function
        function setupCartButton() {
            const cartBtn = document.getElementById('cartBtn');
            if (cartBtn) {
                cartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showCartModal();
                });
            }
        }

        // Add this new function
        function updateCartCount() {
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = cartItems.length;
            }
        }

        // Initialize when page loads
        init();