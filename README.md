# Goodies Pricing Calculator

Simple local pricing calculator for Goodies products. It uses a conservative "protected cost" model so pricing includes shipping, customs, hidden operating costs, damage/loss reserve, and a no-loss floor price.

## How to Use

1. Open `index.html` in a browser.
2. Enter the basic product information first: RMB unit cost, quantity, and rarity level.
3. Open `Advanced safety costs` only when you want to adjust shipping, tax, damage reserve, hidden cost buffer, or safety cushion.
4. Use the no-loss floor, recommended price, margin, profit, buying decision, and promotion suggestion to decide the selling price.
5. Click `Copy` to copy a pricing summary, or `Print` to save/print the result.

## Pricing Logic

The app calculates a base landed cost first, then protects it with:

- Damage / loss reserve
- Hidden Aruba cost buffer
- Safety cushion per unit
- Expected sellable quantity instead of assuming every item sells
- Goodies price tiers rounded upward, not downward
- Target margin pricing instead of hard 2x-3x multipliers, so prices stay safer without becoming too inflated

The no-loss floor is the lowest Goodies tier above the protected cost. Suggested prices are then calculated from rarity-based target margins and a minimum profit amount, so every listed price should stay above the protected cost.

## Sharing With Friends

Send these files together in one folder:

- `index.html`
- `styles.css`
- `script.js`

No installation is needed. The app has no backend and does not upload data.

The optional photo upload is only a local preview. It does not recognize product details automatically.
