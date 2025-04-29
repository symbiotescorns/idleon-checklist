document.addEventListener("DOMContentLoaded", () => {
    const beginnerButton = document.querySelector('.controls .image-button:nth-child(1)');
    const vectorButton = document.querySelector('.controls .image-button:nth-child(2)');

    // Functionality for Beginner 1.png button
    beginnerButton.addEventListener('click', () => {
        fetch('./quote.json')
            .then(response => response.json())
            .then(data => {
                const randomQuote = data.quotes[Math.floor(Math.random() * data.quotes.length)];

                const popup = document.createElement('div');
                popup.style.position = 'fixed';
                popup.style.top = '50%';
                popup.style.left = '50%';
                popup.style.transform = 'translate(-50%, -50%)';
                popup.style.zIndex = '1000';
                popup.style.textAlign = 'center';
                popup.style.cursor = 'pointer'; // Make the popup clickable

                const imageContainer = document.createElement('div');
                imageContainer.style.position = 'relative';
                imageContainer.style.display = 'inline-block';

                const image = document.createElement('img');
                image.src = './assets/site/judgement 1.png';
                image.alt = 'Popup Image';
                image.style.maxWidth = '100%';
                image.style.border = 'none';

                const quote = document.createElement('p');
                quote.textContent = randomQuote;
                quote.style.position = 'absolute';
                quote.style.top = '40%'; // Move text slightly higher
                quote.style.left = '40%';
                quote.style.transform = 'translate(-50%, -50%)';
                quote.style.margin = '0';
                quote.style.padding = '0';
                quote.style.fontSize = '1.8rem'; // Increase font size
                quote.style.fontFamily = "'Poppins', sans-serif"; // Use Poppins font
                quote.style.color = '#000000'; // Change text color to black
                quote.style.textAlign = 'center'; // Ensure text is centered
                quote.style.whiteSpace = 'normal'; // Allow text wrapping
                quote.style.wordWrap = 'break-word'; // Ensure long words wrap properly

                imageContainer.appendChild(image);
                imageContainer.appendChild(quote);
                popup.appendChild(imageContainer);

                // Add click event to close the popup
                popup.addEventListener('click', () => {
                    document.body.removeChild(popup);
                });

                document.body.appendChild(popup);
            })
            .catch(error => console.error('Error fetching quotes:', error));
    });

    // Functionality for Vector 1.png button (Cog Icon)
    vectorButton.addEventListener('click', () => {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#1e1e1e';
        popup.style.padding = '30px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
        popup.style.zIndex = '1000';
        popup.style.width = '50%';
        popup.style.height = '30%';
        popup.style.color = '#ffffff';
        popup.style.textAlign = 'center';
        popup.style.overflow = 'hidden';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '1.5rem';
        closeButton.style.color = '#ffffff';
        closeButton.style.cursor = 'pointer';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(popup);
        });

        const placeholderText = document.createElement('p');
        placeholderText.textContent = 'Functions not currently available in your region.';
        placeholderText.style.marginTop = '50px';
        placeholderText.style.fontSize = '1.2rem';

        popup.appendChild(closeButton);
        popup.appendChild(placeholderText);
        document.body.appendChild(popup);
    });
});
