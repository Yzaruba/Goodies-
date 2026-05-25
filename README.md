# Goodies Pricing Calculator

Simple local pricing calculator for Goodies products. It uses a conservative "protected cost" model so pricing includes per-unit shipping, customs, hidden operating costs, damage/loss reserve, and a no-loss floor price.

## How to Use

1. Open `index.html` in a browser.
2. Enter the basic product information first: RMB unit cost, quantity, rarity level, and pricing mode.
3. Open `Advanced safety costs` only when you want to adjust shipping, tax, damage reserve, hidden cost buffer, or safety cushion.
4. Use the no-loss floor, recommended price, margin, profit, buying decision, and promotion suggestion to decide the selling price.
5. Click `Copy` to copy a pricing summary, or `Print` to save/print the result.

## Pricing Logic

The app calculates a base landed cost first, then protects it with:

- Damage / loss reserve
- Hidden Aruba cost buffer
- Safety cushion per unit
- Shared shipping and tax divided by quantity
- Expected sellable quantity display for profit planning
- Goodies retail prices rounded to the nearest selling tier
- Pricing mode multipliers for impulse, gift, boutique, and premium collectible items

The protected cost uses:

`baseRmbPerUnit = rmbUnitCost + chinaShippingRmb / quantity`

`baseAwgPerUnit = baseRmbPerUnit * exchangeRate + internationalShippingAwg / quantity + customsTaxAwg / quantity`

`protectedCost = baseAwgPerUnit + damageReserveCost + hiddenCostCost + safetyCushionAwg`

Suggested retail prices use the selected pricing mode multiplier, then round to the nearest Goodies selling tier.

## Sharing With Friends

Send these files together in one folder:

- `index.html`
- `styles.css`
- `script.js`

No installation is needed. The app has no backend and does not upload data.

The optional photo upload is only a local preview. It does not recognize product details automatically.
