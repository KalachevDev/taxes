const form = document.getElementById('form')

function isValidNumber(number) {
    const parsedNumber = Number(number);

    return !Number.isNaN(parsedNumber) && Number.isFinite(parsedNumber);
}

form.addEventListener('submit', event => {
    event.preventDefault();

    const amount = Number(event.target.elements['amount'].value);

    if (!isValidNumber(amount) || amount === 0) {
        return;
    }

    const info = getPrint(amount);

    document.getElementById('result').innerHTML = info;
})

const multiplyButton = document.getElementById('multiply-button');

multiplyButton.addEventListener('click', () => {
    const amountInput = document.getElementById('amount');

    const currentAmount = amountInput.value;

    if (!isValidNumber(currentAmount)) {
        return;
    }

    amountInput.value = currentAmount * 12;
});

const NEW_TAX_BRACKETS = [
    {
        max: 2400000,
        tax: 0.13,
    },
    {
        max: 5000000,
        tax: 0.15,
    },
    {
        max: 20000000,
        tax: 0.18,
    },
    {
        max: 50000000,
        tax: 0.2,
    },
    {
        max: Infinity,
        tax: 0.22,
    },
];

const CURRENT_TAX_BRACKETS = [
    {
        max: 5000000,
        tax: 0.13,
    },
    {
        max: Infinity,
        tax: 0.15,
    },
];

function getTaxesByBrackets(possibleGrossPerYear, brackets) {
    const grossPerYear = Number(possibleGrossPerYear);

    if (Number.isNaN(grossPerYear) || !Number.isFinite(grossPerYear) || grossPerYear < 0) {
        return 0;
    }

    let totalTax = 0;
    let alreadyTaxed = 0;

    for (const {max, tax} of brackets) {
        if (grossPerYear <= alreadyTaxed) {
            return totalTax;
        }

        const amountToTaxByCurrentBracket =
            grossPerYear > max ? max - alreadyTaxed : grossPerYear - alreadyTaxed;

        alreadyTaxed += amountToTaxByCurrentBracket;
        totalTax += amountToTaxByCurrentBracket * tax;
    }

    return totalTax;
}

function getPrint(grossPerYear) {
    const currentTax = getTaxesByBrackets(grossPerYear, CURRENT_TAX_BRACKETS);
    const newTax = getTaxesByBrackets(grossPerYear, NEW_TAX_BRACKETS);

    const currentNetPerYear = grossPerYear - currentTax;
    const newNetPerYear = grossPerYear - newTax;

    const currentNetPerMonth = currentNetPerYear / 12;
    const newNetPerMonth = newNetPerYear / 12;

    const currentTaxPercentage = currentTax / grossPerYear;
    const newTaxPercentage = newTax / grossPerYear;

    const taxDiffInPercent = (newTaxPercentage - currentTaxPercentage) * 100;
    const taxDiffInCurrencyPerMonth = (newTax - currentTax) / 12;

    const formatAmount = Intl.NumberFormat('ru').format;

    return `
        <div><strong>Текущая зарплата в год (чистыми): </strong> ${formatAmount(currentNetPerYear)}</div>
        <div><strong>Будущая зарплата в год (чистыми): </strong> ${formatAmount(newNetPerYear)}</div>
        <div>---</div>
        <div><strong>Текущая зарплата в месяц (чистыми): </strong> ${formatAmount(currentNetPerMonth)}</div>
        <div><strong>Будущая зарплата в месяц (чистыми): </strong> ${formatAmount(newNetPerMonth)}</div>
        <div>---</div>
        <div><strong>Текущие налоги: </strong> ${formatAmount(currentTax)}</div>
        <div><strong>Новые налоги: </strong> ${formatAmount(newTax)}</div>
        <div>---</div>
        <div><strong>Разница налогов в %: </strong> ${taxDiffInPercent}</div>
        <div><strong>Разница налогов в валюте (в месяц): </strong> ${formatAmount(taxDiffInCurrencyPerMonth)}</div>
    `;
}
