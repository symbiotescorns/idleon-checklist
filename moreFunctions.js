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
                quote.style.top = '38%'; // Move text slightly higher
                quote.style.left = '40%';
                quote.style.transform = 'translate(-50%, -50%)';
                quote.style.margin = '0';
                quote.style.padding = '0';
                quote.style.fontSize = '1.8rem'; // Increase font size
                quote.style.fontFamily = "'Poppins', sans-serif"; // Use Poppins font
                quote.style.fontWeight = '600'; // Make text semi-bold
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
        popup.className = 'settings-popup';

        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.className = 'close-button';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(popup);
        });

        const title = document.createElement('h2');
        title.textContent = 'Settings';

        const hideTimersCheckbox = document.createElement('input');
        hideTimersCheckbox.type = 'checkbox';
        hideTimersCheckbox.id = 'hide-timers';
        hideTimersCheckbox.checked = localStorage.getItem('hideTimers') === 'true';
        hideTimersCheckbox.addEventListener('change', () => {
            const timersSection = document.querySelector('.timers-section');
            if (hideTimersCheckbox.checked) {
                timersSection.style.display = 'none';
                localStorage.setItem('hideTimers', 'true');
            } else {
                timersSection.style.display = 'flex';
                localStorage.setItem('hideTimers', 'false');
            }
        });

        const hideTimersLabel = document.createElement('label');
        hideTimersLabel.htmlFor = 'hide-timers';
        hideTimersLabel.textContent = 'Hide Timers';

        const hideTimersContainer = document.createElement('div');
        hideTimersContainer.className = 'checklist-item';
        hideTimersContainer.appendChild(hideTimersCheckbox);
        hideTimersContainer.appendChild(hideTimersLabel);

        const hideCardsTitle = document.createElement('h3');
        hideCardsTitle.textContent = 'Hide Specific Cards';

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'checklist-container';

        const addedCards = new Set(); // Track already added cards to avoid duplicates

        document.querySelectorAll('.card').forEach(card => {
            const cardName = card.dataset.world || 'General';
            if (!addedCards.has(cardName)) {
                addedCards.add(cardName); // Mark this card as added

                const cardCheckbox = document.createElement('input');
                cardCheckbox.type = 'checkbox';
                cardCheckbox.id = `hide-card-${cardName}`;
                cardCheckbox.checked = localStorage.getItem(`hideCard-${cardName}`) === 'true';
                cardCheckbox.addEventListener('change', () => {
                    if (cardCheckbox.checked) {
                        card.style.display = 'none';
                        localStorage.setItem(`hideCard-${cardName}`, 'true');
                    } else {
                        card.style.display = 'block';
                        localStorage.setItem(`hideCard-${cardName}`, 'false');
                    }
                });

                const cardLabel = document.createElement('label');
                cardLabel.htmlFor = `hide-card-${cardName}`;
                cardLabel.textContent = `Hide ${cardName} Card`;

                const cardOption = document.createElement('div');
                cardOption.className = 'checklist-item';
                cardOption.appendChild(cardCheckbox);
                cardOption.appendChild(cardLabel);

                cardsContainer.appendChild(cardOption);
            }
        });

        popup.appendChild(closeButton);
        popup.appendChild(title);
        popup.appendChild(hideTimersContainer);
        popup.appendChild(hideCardsTitle);
        popup.appendChild(cardsContainer);
        document.body.appendChild(popup);
    });

    // Restore hidden timers and cards on page load
    if (localStorage.getItem('hideTimers') === 'true') {
        document.querySelector('.timers-section').style.display = 'none';
    }
    document.querySelectorAll('.card').forEach(card => {
        const cardName = card.dataset.world || 'General';
        if (localStorage.getItem(`hideCard-${cardName}`) === 'true') {
            card.style.display = 'none';
        }
    });
});
