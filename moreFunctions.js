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
                quote.style.top = '43%'; // Move text slightly more up
                quote.style.left = '43%'; // Move text slightly more to the left
                quote.style.transform = 'translate(-50%, -50%)';
                quote.style.margin = '0';
                quote.style.padding = '0';
                quote.style.fontSize = '1.2rem';
                quote.style.fontWeight = 'bold';
                quote.style.color = '#000000'; // Change text color to black

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

    // Placeholder functionality for Vector 1 button
    vectorButton.addEventListener('click', () => {
        alert('Placeholder functionality for Vector 1 button.');
    });
});
