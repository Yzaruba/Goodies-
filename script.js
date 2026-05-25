const priceTiers = [5, 7.5, 10, 12.5, 15, 17.5, 20, 25, 30, 35, 45, 55, 65, 75, 95, 125, 150, 180, 220];

const marginProfiles = {
  Normal: { min: 0.32, recommended: 0.42, boutique: 0.5, premium: 0.56 },
  Limited: { min: 0.36, recommended: 0.48, boutique: 0.55, premium: 0.6 },
  Hot: { min: 0.38, recommended: 0.52, boutique: 0.58, premium: 0.63 },
  Premium: { min: 0.42, recommended: 0.56, boutique: 0.62, premium: 0.66 },
};

const pricePlans = [
  { label: "Minimum no-loss price", key: "min" },
  { label: "Recommended price", key: "recommended" },
  { label: "Boutique price", key: "boutique" },
  { label: "Premium price", key: "premium" },
];

const fields = {
  productName: document.querySelector("#productName"),
  category: document.querySelector("#category"),
  rmbUnitCost: document.querySelector("#rmbUnitCost"),
  quantity: document.querySelector("#quantity"),
  chinaShipping: document.querySelector("#chinaShipping"),
  internationalShipping: document.querySelector("#internationalShipping"),
  customsTax: document.querySelector("#customsTax"),
  exchangeRate: document.querySelector("#exchangeRate"),
  rarity: document.querySelector("#rarity"),
  damageRate: document.querySelector("#damageRate"),
  hiddenCostRate: document.querySelector("#hiddenCostRate"),
  safetyCushion: document.querySelector("#safetyCushion"),
};

const output = {
  recommendationLabel: document.querySelector("#recommendationLabel"),
  recommendationNote: document.querySelector("#recommendationNote"),
  productMeta: document.querySelector("#productMeta"),
  rmbLanded: document.querySelector("#rmbLanded"),
  awgLanded: document.querySelector("#awgLanded"),
  protectedCost: document.querySelector("#protectedCost"),
  floorPrice: document.querySelector("#floorPrice"),
  sellableQty: document.querySelector("#sellableQty"),
  priceRows: document.querySelector("#priceRows"),
  promotion: document.querySelector("#promotion"),
  promotionNote: document.querySelector("#promotionNote"),
  buyingDecision: document.querySelector("#buyingDecision"),
  buyingDecisionNote: document.querySelector("#buyingDecisionNote"),
  formAlert: document.querySelector("#formAlert"),
  copyStatus: document.querySelector("#copyStatus"),
  photoPreview: document.querySelector("#photoPreview"),
  photoStatus: document.querySelector("#photoStatus"),
};

const photoInput = document.querySelector("#productPhoto");
const removePhotoButton = document.querySelector("#removePhoto");
const sampleButton = document.querySelector("#sampleButton");
const copySummaryButton = document.querySelector("#copySummary");
const printButton = document.querySelector("#printButton");
let photoObjectUrl = "";
let latestSummary = "";

function numberValue(field) {
  return Number.parseFloat(field.value) || 0;
}

function money(value, currency = "AWG") {
  return `${currency} ${value.toFixed(2)}`;
}

function roundUpTier(value) {
  const tier = priceTiers.find((price) => price >= value);

  if (tier) {
    return tier;
  }

  return Math.ceil(value / 10) * 10;
}

function minimumProfitFor(cost) {
  if (cost < 5) {
    return 2;
  }

  if (cost <= 15) {
    return 4;
  }

  if (cost <= 35) {
    return 7;
  }

  return 10;
}

function priceForMargin(cost, margin) {
  return cost / (1 - margin);
}

function getRecommendation(cost) {
  if (cost <= 0) {
    return {
      label: "Enter product cost",
      note: "Add the RMB cost and quantity to get a protected selling price.",
    };
  }

  if (cost < 5) {
    return {
      label: "Impulse Buy",
      note: "Small add-on item. Keep the price easy, but do not discount too early.",
    };
  }

  if (cost <= 15) {
    return {
      label: "Gift Item",
      note: "Good for gifting and bundles after the protected margin is covered.",
    };
  }

  if (cost <= 35) {
    return {
      label: "Boutique Product",
      note: "Needs boutique presentation and controlled discounting.",
    };
  }

  return {
    label: "Premium / Limited Product",
    note: "Use limited-stock positioning and avoid promos unless inventory is slow.",
  };
}

function getPromotion(cost, recommendedPrice, quantity, rarity) {
  if (cost <= 0 || quantity <= 0) {
    return {
      label: "Enter product details",
      note: "Fill in product cost and quantity to get a promotion suggestion.",
    };
  }

  if (rarity !== "Normal" || quantity <= 3 || cost > 35) {
    return {
      label: "Limited stock, no discount",
      note: "Protect margin because this item is rare, low-stock, or high-cost.",
    };
  }

  if (recommendedPrice <= 10 && quantity >= 9) {
    return {
      label: "3 for 15",
      note: "Only use this for very low-cost items with enough stock to absorb the bundle.",
    };
  }

  if (recommendedPrice >= 30 && recommendedPrice <= 45 && quantity >= 6) {
    return {
      label: "2 for 75",
      note: "Safer than 2 for 55 once Aruba landing costs and damage are included.",
    };
  }

  if (cost < 12 && quantity >= 9) {
    return {
      label: "Buy 2 Get 1",
      note: "Use only after the recommended price already gives strong profit per unit.",
    };
  }

  return {
    label: "Limited stock, no discount",
    note: "The current cost or stock level is better suited to straight pricing.",
  };
}

function getBuyingDecision(cost, minimumPrice, recommendedPrice, quantity) {
  if (cost <= 0) {
    return {
      label: "Enter product cost",
      note: "Add the RMB unit cost first. Shipping defaults are ignored until the product has a real cost.",
    };
  }

  if (minimumPrice > 220 || cost > 125) {
    return {
      label: "Pre-order only",
      note: "The protected cost is too high for the current Goodies tiers. Only buy after a customer confirms.",
    };
  }

  if (recommendedPrice >= 125 || cost > 55) {
    return {
      label: "Buy very carefully",
      note: "This can avoid loss, but it needs premium positioning or very limited stock.",
    };
  }

  if (quantity <= 3) {
    return {
      label: "Small test batch",
      note: "The price is safe, but low quantity leaves little room for bundles or mistakes.",
    };
  }

  if (recommendedPrice <= 35) {
    return {
      label: "Safe to test",
      note: "The no-loss price is still friendly for customers, so this is a good trial product.",
    };
  }

  return {
    label: "Safe if presented well",
    note: "The product can be profitable, but the display and story need to support the price.",
  };
}

function clearPhoto() {
  if (photoObjectUrl) {
    URL.revokeObjectURL(photoObjectUrl);
    photoObjectUrl = "";
  }

  photoInput.value = "";
  output.photoPreview.innerHTML = "<span>No photo uploaded</span>";
  output.photoStatus.textContent = "Optional photo preview only. The image is not uploaded anywhere.";
}

function handlePhotoUpload() {
  const file = photoInput.files?.[0];

  if (!file) {
    clearPhoto();
    return;
  }

  if (!file.type.startsWith("image/")) {
    clearPhoto();
    output.photoStatus.textContent = "Please upload an image file.";
    return;
  }

  if (photoObjectUrl) {
    URL.revokeObjectURL(photoObjectUrl);
  }

  photoObjectUrl = URL.createObjectURL(file);
  output.photoPreview.innerHTML = `<img src="${photoObjectUrl}" alt="Uploaded product photo preview" />`;
  output.photoStatus.textContent = "Photo loaded for reference. It stays on this device.";
}

function clampPercent(value, fallback) {
  if (value <= 0) {
    return fallback;
  }

  return Math.min(value, 80) / 100;
}

function rarityDamageReserve(rarity) {
  const reserveByRarity = {
    Normal: 10,
    Limited: 12,
    Hot: 14,
    Premium: 16,
  };

  return reserveByRarity[rarity] || reserveByRarity.Normal;
}

function validateInputs(quantity, exchangeRate, damageRate, hiddenCostRate) {
  const messages = [];

  if (numberValue(fields.quantity) > 0 && quantity !== numberValue(fields.quantity)) {
    messages.push("Quantity was rounded down to a whole number for profit calculations.");
  }

  if (numberValue(fields.quantity) <= 0) {
    messages.push("Quantity defaults to 1 until you enter a larger number.");
  }

  if (exchangeRate <= 0) {
    messages.push("Exchange rate must be above 0. The default 0.26 rate is used when blank.");
  }

  if (damageRate >= 0.35) {
    messages.push("Damage reserve is very high, so prices will rise sharply to protect profit.");
  }

  if (hiddenCostRate >= 0.35) {
    messages.push("Hidden cost buffer is high. Check if the item needs a premium price or no discount.");
  }

  output.formAlert.hidden = messages.length === 0;
  output.formAlert.textContent = messages.join(" ");
}

function buildSummary(productName, category, rarity, costs, priceData, promotion) {
  const title = productName || "Untitled product";
  const lines = [
    `Goodies Pricing Summary`,
    `Product: ${title}`,
    `Category: ${category || "No category"}`,
    `Rarity: ${rarity}`,
    `Base RMB cost/unit: ${money(costs.rmbLanded, "RMB")}`,
    `Base AWG cost/unit: ${money(costs.awgLanded)}`,
    `Protected cost/sellable unit: ${money(costs.protectedCost)}`,
    `No-loss floor price: ${money(costs.floorPrice)}`,
    `Expected sellable quantity: ${costs.sellableQty}`,
    `Damage reserve: ${(costs.damageRate * 100).toFixed(0)}%`,
    `Hidden cost buffer: ${(costs.hiddenCostRate * 100).toFixed(0)}%`,
    "",
    ...priceData.map(
      (item) =>
        `${item.label}: ${money(item.price)} | margin ${item.margin.toFixed(1)}% | profit/unit ${money(
          item.profit,
        )} | total profit ${money(item.totalProfit)}`,
    ),
    "",
    `Suggested promotion: ${promotion.label}`,
    `Note: ${promotion.note}`,
  ];

  return lines.join("\n");
}

function calculate() {
  const quantity = Math.max(1, Math.floor(numberValue(fields.quantity)));
  const exchangeRate = numberValue(fields.exchangeRate) || 0.26;
  const rarity = fields.rarity.value;
  const damageInput = numberValue(fields.damageRate);
  const hiddenInput = numberValue(fields.hiddenCostRate);
  const damageRate = clampPercent(damageInput, rarityDamageReserve(rarity));
  const hiddenCostRate = clampPercent(hiddenInput, 25);
  const safetyCushion = numberValue(fields.safetyCushion) || 2;
  validateInputs(quantity, exchangeRate, damageRate, hiddenCostRate);

  const rmbLanded = numberValue(fields.rmbUnitCost) + numberValue(fields.chinaShipping) / quantity;
  const awgLanded =
    rmbLanded * exchangeRate +
    numberValue(fields.internationalShipping) / quantity +
    numberValue(fields.customsTax) / quantity;
  const sellableQty = Math.max(1, Math.floor(quantity * (1 - damageRate)));
  const totalBaseCost = awgLanded * quantity;
  const baseCostPerSellableUnit = totalBaseCost / sellableQty;
  const protectedCost = baseCostPerSellableUnit * (1 + hiddenCostRate) + safetyCushion;

  const productName = fields.productName.value.trim();
  const category = fields.category.value.trim();
  const hasCosts = numberValue(fields.rmbUnitCost) > 0 && protectedCost > 0 && awgLanded > 0;
  const profile = marginProfiles[rarity] || marginProfiles.Normal;
  const floorPrice = hasCosts ? roundUpTier(protectedCost) : 0;

  output.productMeta.textContent = [productName || "Untitled product", category || "No category", rarity]
    .filter(Boolean)
    .join(" / ");
  output.rmbLanded.textContent = money(hasCosts ? rmbLanded : 0, "RMB");
  output.awgLanded.textContent = money(hasCosts ? awgLanded : 0);
  output.protectedCost.textContent = money(hasCosts ? protectedCost : 0);
  output.floorPrice.textContent = money(floorPrice);
  output.sellableQty.textContent = hasCosts ? `${sellableQty} of ${quantity}` : "0";

  const priceData = pricePlans.map((item) => {
    const marginTarget = profile[item.key];
    const rawPrice = Math.max(priceForMargin(protectedCost, marginTarget), protectedCost + minimumProfitFor(protectedCost));
    const tierPrice = roundUpTier(rawPrice);
    const profit = tierPrice - protectedCost;
    const margin = tierPrice > 0 ? (profit / tierPrice) * 100 : 0;
    return {
      ...item,
      marginTarget,
      price: hasCosts ? tierPrice : 0,
      profit: hasCosts ? profit : 0,
      margin: hasCosts ? margin : 0,
      totalProfit: hasCosts ? profit * sellableQty : 0,
    };
  });

  output.priceRows.innerHTML = priceData
    .map(
      (item) => `
        <tr>
          <td>${item.label}</td>
          <td><strong>${money(item.price)}</strong></td>
          <td>${item.margin.toFixed(1)}%</td>
          <td>${money(item.profit)}</td>
          <td>${money(item.totalProfit)}</td>
        </tr>
      `,
    )
    .join("");

  const activeCost = hasCosts ? protectedCost : 0;
  const recommendation = getRecommendation(activeCost);
  const recommendedPrice = priceData[1]?.price || 0;
  const minimumPrice = priceData[0]?.price || 0;
  const promotion = getPromotion(activeCost, recommendedPrice, sellableQty, rarity);
  const buyingDecision = getBuyingDecision(activeCost, minimumPrice, recommendedPrice, sellableQty);

  output.recommendationLabel.textContent = recommendation.label;
  output.recommendationNote.textContent = recommendation.note;
  output.promotion.textContent = promotion.label;
  output.promotionNote.textContent = promotion.note;
  output.buyingDecision.textContent = buyingDecision.label;
  output.buyingDecisionNote.textContent = buyingDecision.note;
  latestSummary = buildSummary(
    productName,
    category,
    rarity,
    { rmbLanded, awgLanded, protectedCost, floorPrice, sellableQty, damageRate, hiddenCostRate },
    priceData,
    promotion,
  );
  output.copyStatus.textContent = "";
}

document.querySelector("#pricingForm").addEventListener("input", calculate);
document.querySelector("#pricingForm").addEventListener("reset", () => {
  window.setTimeout(() => {
    clearPhoto();
    fields.exchangeRate.value = "0.26";
    fields.chinaShipping.value = "20";
    fields.internationalShipping.value = "18";
    fields.customsTax.value = "4";
    fields.damageRate.value = "12";
    fields.hiddenCostRate.value = "25";
    fields.safetyCushion.value = "2.00";
    calculate();
  }, 0);
});

photoInput.addEventListener("change", handlePhotoUpload);
removePhotoButton.addEventListener("click", clearPhoto);
sampleButton.addEventListener("click", () => {
  fields.productName.value = "Pop Mart blind box";
  fields.category.value = "Collectibles";
  fields.rmbUnitCost.value = "39";
  fields.quantity.value = "12";
  fields.chinaShipping.value = "28";
  fields.internationalShipping.value = "22";
  fields.customsTax.value = "6";
  fields.exchangeRate.value = "0.26";
  fields.damageRate.value = "14";
  fields.hiddenCostRate.value = "22";
  fields.safetyCushion.value = "2.00";
  fields.rarity.value = "Hot";
  calculate();
});

copySummaryButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(latestSummary);
    output.copyStatus.textContent = "Pricing summary copied.";
  } catch {
    output.copyStatus.textContent = "Copy failed. Select the result text manually if your browser blocks clipboard access.";
  }
});

printButton.addEventListener("click", () => {
  window.print();
});

calculate();
