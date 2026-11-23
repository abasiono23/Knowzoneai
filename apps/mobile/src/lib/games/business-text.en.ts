/**
 * English source for the Business District words added with the ten-level ladder: the analyst's desk
 * questions (one per kind in apps/server/src/data/business/analyst.ts, numbers filled in by the
 * server) and the new labels of the restyled games. The other nine languages are made from this by
 * apps/server/scripts/business-history-content.ts into business-text.ts, which adds them all to the
 * "business" namespace. Keep {{placeholders}} exactly as the server names them.
 */
const en = {
  games: {
    'startup-tycoon': {
      tagline: 'Run a company month by month, then value it like an analyst.',
      rules: {
        r1: 'Each month, choose your team, your marketing and an answer to a management dilemma. The server runs the month and sends your profit and loss.',
        r2: 'Grow the company’s value to the goal without running out of cash. A poor decision or going bankrupt costs a heart.',
        r3: 'From Beginner, the analyst’s desk at the end asks about your numbers: margins, runway, and at the top dilution and DCF valuation.',
        example: 'Revenue $9,000 − cost of sales $3,000 = gross profit $6,000; after $5,200 of payroll and rent, the month made $800.',
      },
    },
    'budget-master': {
      tagline: 'Plan every dollar, from pocket money to paying off debt.',
      rules: {
        r1: 'Each month, pay the bills, then share out the rest: food, fun, clothes, an emergency fund, a savings goal and extra debt payments. Every dollar must have a job.',
        r2: 'Then something happens: choose how to handle it. Skipping food or a poor choice costs a heart.',
        r3: 'Higher levels bring rent, card debt with interest and irregular pay; the analyst’s desk asks about interest, loans, tax and saving for retirement.',
        example: '$400 of pocket money: $60 of bills, $80 for food, $40 for fun, $220 saved (55%).',
      },
    },
    'market-master': {
      tagline: 'Price a market stall, then read markets like an economist.',
      rules: {
        r1: 'Each day, set your price and how much stock to buy. Weather, crowds and a rival change how many customers come.',
        r2: 'Unsold stock is wasted and a loss costs a heart. The closer you get to the best profit, the more points.',
        r3: 'Market research fades from Upper-intermediate; the analyst’s desk goes from revenue to elasticity, monopoly, concentration and Cournot competition.',
        example: '60 cups sold at $1.50 is $90 of revenue; with 70 cups bought at $0.50 and a $10 fee, profit is $45.',
      },
    },
    'profit-quest': {
      tagline: 'Master the maths of profit, then run a factory week by week.',
      rules: {
        r1: 'Business maths and factory weeks take turns. Work out each sum, then choose an answer.',
        r2: 'In a factory week, set the price and how many to make; leftovers cost storage. A loss costs a heart.',
        r3: 'The sums climb from contribution and break-even to operating leverage, NPV and the cost of capital, with a shorter clock.',
        example: 'Price $40, cost to make $25: each sale contributes $15. Fixed costs of $1,500 need 100 sales to break even.',
      },
    },
    'market-simulator': {
      tagline: 'Invest practice money and learn risk, return and valuation.',
      rules: {
        r1: 'Each quarter, read the news and split your money between cash, bonds, an index fund and made-up companies (it must add up to 100%).',
        r2: 'Answer the quarter’s investing question. Beating the index and spreading risk earn points; a wrong answer costs a heart.',
        r3: 'Fees and limits on one company arrive at Upper-intermediate; the analyst’s desk goes up to CAPM, bond prices and portfolio risk.',
        example: '60% in an index fund that rose 5% and 40% in bonds that rose 1%: the portfolio rose 3.4%.',
      },
    },
  },
  analyst: {
    eyebrow: 'ANALYST’S DESK',
    step: 'Question {{n}} of {{total}}',
    intro: 'Work it out on paper or with a calculator, then choose.',
    check: 'Check answer',
    right: 'Correct',
    wrong: 'Not quite',
    answerWas: 'The answer is {{answer}}.',
    timeUp: 'Time’s up',
    method: 'METHOD',
    next: 'Next',
    review: 'Analyst’s desk',
    kinds: {
      saveWeeks: {
        name: 'Saving up',
        q: 'You save {{weekly}} a week for headphones that cost {{target}}. How many weeks until you can buy them?',
        how: 'Weeks = price ÷ weekly saving, rounded up: a part-week still means waiting another week.',
      },
      shareOf: {
        name: 'Share of pay',
        q: 'Your take-home pay is {{income}} a month. How much is {{share}} of it?',
        how: 'Amount = pay × percentage ÷ 100. The 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
      },
      simpleInterest: {
        name: 'Simple interest',
        q: 'You borrow {{principal}} at {{rate}} simple interest a year for {{years}} years. How much interest do you pay in total?',
        how: 'Simple interest = principal × rate × years. Interest is only ever charged on the amount first borrowed.',
      },
      cardInterest: {
        name: 'Card interest',
        q: 'Your credit card balance is {{balance}} and the card charges {{rate}} interest a month. If you pay nothing, how much interest is added this month?',
        how: 'Monthly interest = balance × monthly rate. Unpaid, it is added to the balance and earns interest too.',
      },
      compound: {
        name: 'Compound growth',
        q: 'You invest {{principal}} at {{rate}} a year, compounded once a year, for {{years}} years. What is it worth at the end (to the nearest dollar)?',
        how: 'Value = principal × (1 + rate)^years. Each year’s interest earns interest the following years.',
      },
      realRate: {
        name: 'Real return',
        q: 'Your savings earn {{nominal}} a year while prices rise {{inflation}} a year. What is your real return (to one decimal place)?',
        how: 'Real return = (1 + nominal rate) ÷ (1 + inflation) − 1. Nominal minus inflation is only an approximation.',
      },
      ear: {
        name: 'Effective annual rate',
        q: 'A card charges {{monthly}} interest a month, compounded monthly. What is the effective annual rate (to one decimal place)?',
        how: 'Effective annual rate = (1 + monthly rate)^12 − 1. It is higher than 12 × the monthly rate because interest compounds.',
      },
      loanPayment: {
        name: 'Loan repayment',
        q: 'You borrow {{principal}} at {{rate}} a year, repaid in equal monthly payments over {{years}} years (interest charged monthly). What is the monthly payment?',
        how: 'Payment = P × i ÷ (1 − (1 + i)^−n), with i = annual rate ÷ 12 and n = number of months.',
      },
      taxBands: {
        name: 'Tax bands',
        q: 'Income: {{income}}. Tax is 0% on the first {{band1}}, {{rate2}} on income from {{band1}} to {{band2}}, and {{rate3}} on everything above {{band2}}. How much tax is due in total?',
        how: 'Tax each slice of income at its own rate and add the slices up. A higher band never taxes the income below it.',
      },
      retirement: {
        name: 'Saving for retirement',
        q: 'You save {{payment}} at the end of every year for {{years}} years at {{rate}} a year. What is the pot worth after the last payment (to the nearest dollar)?',
        how: 'Future value of an annuity = payment × ((1 + rate)^years − 1) ÷ rate.',
      },
      revenue: {
        name: 'Revenue',
        q: 'You sell {{qty}} cups at {{price}} each. Each cup costs you {{cost}} to make. What is your revenue?',
        how: 'Revenue = quantity sold × price. Revenue is before any costs; profit is what is left after them.',
      },
      profitDay: {
        name: 'A day’s profit',
        q: 'You buy {{bought}} items at {{cost}} each and pay a {{fee}} stall fee. You sell {{qty}} of them at {{price}} each, and the rest are wasted. What is your profit?',
        how: 'Profit = sales × price − everything you bought × its cost − fixed fees. Unsold stock is still a cost.',
      },
      demandAt: {
        name: 'Reading demand',
        q: 'At {{p1}} you get {{q1}} customers; at {{p2}} you get {{q2}}. Demand falls in a straight line. How many customers would you get at {{p3}}?',
        how: 'A straight line loses the same number of customers for every extra dollar: find that slope, then carry it on.',
      },
      elasticity: {
        name: 'Price elasticity',
        q: 'When the price rises from {{p1}} to {{p2}}, sales fall from {{q1}} to {{q2}}. Using the midpoint method, what is the price elasticity of demand (as a positive number, to two decimal places)?',
        how: 'Elasticity = (change in Q ÷ average Q) ÷ (change in P ÷ average P). Above 1 is elastic; below 1 is inelastic.',
      },
      bestPrice: {
        name: 'The best price',
        q: 'Customers a day = {{a}} − {{b}} × price, and each item costs you {{cost}}. Which price makes the most profit?',
        how: 'With straight-line demand, the profit-maximising price is halfway between the cost and the price at which nobody buys: (a ÷ b + cost) ÷ 2.',
      },
      monopolyQ: {
        name: 'Monopoly output',
        q: 'A monopoly faces the demand curve P = {{A}} − {{B}}Q and has a constant marginal cost of {{mc}}. What quantity maximises its profit (to one decimal place)?',
        how: 'Set marginal revenue equal to marginal cost: MR = A − 2BQ, so Q = (A − MC) ÷ 2B.',
      },
      hhi: {
        name: 'Market concentration',
        q: 'The {{firms}} firms in a market have shares of {{shares}}. What is the Herfindahl–Hirschman Index (HHI)?',
        how: 'HHI = the sum of every firm’s squared market share (in %). Above 2,500 is usually treated as highly concentrated.',
      },
      cournot: {
        name: 'Duopoly (Cournot)',
        q: 'Two identical firms compete on quantity. Market demand is P = {{A}} − {{B}}(q₁ + q₂) and each has a constant marginal cost of {{mc}}. In the Cournot equilibrium, how much does each firm produce (to one decimal place)?',
        how: 'Each firm’s best response is q = (A − MC − Bq_other) ÷ 2B; with identical firms, q = (A − MC) ÷ 3B.',
      },
      deadweight: {
        name: 'Deadweight loss',
        q: 'A monopoly faces P = {{A}} − {{B}}Q with a constant marginal cost of {{mc}}. Compared with perfect competition, what is the deadweight loss (to the nearest dollar)?',
        how: 'Monopoly makes Q = (A − MC) ÷ 2B, half the competitive Q = (A − MC) ÷ B. The lost triangle is (A − MC)² ÷ 8B.',
      },
      operatingLeverage: {
        name: 'Operating leverage',
        q: 'You sell {{units}} units at {{price}}; each costs {{unit}} to make, and fixed costs are {{fixed}}. What is the degree of operating leverage (to two decimal places)?',
        how: 'DOL = total contribution ÷ operating profit. A DOL of 3 means a 1% change in sales moves profit by about 3%.',
      },
      npv: {
        name: 'Net present value',
        q: 'A machine costs {{cost}} today and brings in {{cash}} at the end of each year for {{years}} years. At a {{rate}} discount rate, what is its NPV (to the nearest dollar)?',
        how: 'NPV = cash × (1 − (1 + r)^−years) ÷ r − cost. Invest when the NPV is positive.',
      },
      wacc: {
        name: 'Cost of capital',
        q: 'A company has {{equity}} of equity costing {{re}} and {{debt}} of debt costing {{rd}} before tax. The tax rate is {{tax}}. What is its WACC (to two decimal places)?',
        how: 'WACC = E ÷ V × cost of equity + D ÷ V × cost of debt × (1 − tax), where V = E + D. Interest is tax-deductible.',
      },
      projectNpv: {
        name: 'Project appraisal',
        q: 'A company with {{equity}} of equity (cost {{re}}) and {{debt}} of debt (cost {{rd}} before tax, tax rate {{tax}}) considers a project costing {{cost}} that returns {{cash}} at the end of each year for {{years}} years. Discounted at the company’s WACC, what is the project’s NPV (to the nearest dollar)?',
        how: 'First the WACC = E ÷ V × re + D ÷ V × rd × (1 − tax); then NPV = cash × (1 − (1 + WACC)^−years) ÷ WACC − cost.',
      },
      dividendYield: {
        name: 'Dividend yield',
        q: 'A share costs {{price}} and pays a dividend of {{dividend}} a year. What is its dividend yield (to one decimal place)?',
        how: 'Dividend yield = yearly dividend ÷ share price × 100.',
      },
      portfolioReturn: {
        name: 'Portfolio return',
        q: 'You hold {{w1}} of your money in a fund that returned {{r1}} and {{w2}} in one that returned {{r2}}. What did your whole portfolio return?',
        how: 'Portfolio return = each holding’s weight × its return, added up.',
      },
      peValue: {
        name: 'Price from P/E',
        q: 'A company earns {{eps}} per share. Similar companies trade at a price/earnings ratio of {{pe}}. What share price does that suggest?',
        how: 'Price = earnings per share × P/E ratio.',
      },
      capm: {
        name: 'CAPM',
        q: 'The risk-free rate is {{rf}}, the market is expected to return {{rm}}, and a share has a beta of {{beta}}. Using CAPM, what return should investors expect (to one decimal place)?',
        how: 'Expected return = risk-free rate + beta × (market return − risk-free rate).',
      },
      sharpe: {
        name: 'Sharpe ratio',
        q: 'A fund returned {{rp}} with a standard deviation of {{sd}}; the risk-free rate was {{rf}}. What is its Sharpe ratio (to two decimal places)?',
        how: 'Sharpe ratio = (return − risk-free rate) ÷ standard deviation: the extra return earned for each unit of risk.',
      },
      gordon: {
        name: 'Dividend discount model',
        q: 'A share has just paid a dividend of {{d0}}. Dividends grow {{g}} a year forever and investors require {{r}}. What is the share worth (Gordon growth model)?',
        how: 'Value = next year’s dividend ÷ (required return − growth) = D₀ × (1 + g) ÷ (r − g).',
      },
      bondPrice: {
        name: 'Bond price',
        q: 'A bond with a face value of {{face}} pays a {{coupon}} coupon once a year and matures in {{years}} years. If the market yield is {{y}}, what is its price?',
        how: 'Price = the coupons discounted as an annuity + the face value ÷ (1 + yield)^years. Prices fall when yields rise.',
      },
      twoAssetSd: {
        name: 'Portfolio risk',
        q: 'You put {{w1}} in asset A (standard deviation {{s1}}) and {{w2}} in asset B (standard deviation {{s2}}). Their correlation is {{rho}}. What is the portfolio’s standard deviation (to one decimal place)?',
        how: 'σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). Below a correlation of 1, mixing assets lowers risk: diversification.',
      },
      grossMargin: {
        name: 'Gross margin',
        q: 'You sell a product for {{price}}. It costs {{unit}} to make and deliver. What is your gross margin (to one decimal place)?',
        how: 'Gross margin = (price − cost of the sale) ÷ price × 100.',
      },
      runway: {
        name: 'Runway',
        q: 'A startup has {{cash}} in the bank. It brings in {{revenue}} a month and spends {{costs}} a month. For how many whole months can it keep going?',
        how: 'Runway = cash ÷ monthly burn, where burn = costs − revenue. Round down: the last part-month isn’t covered.',
      },
      ltvCac: {
        name: 'LTV : CAC',
        q: 'A customer pays {{monthly}} a month at a {{gm}} gross margin and stays {{months}} months on average. Winning each customer costs {{cac}}. What is the LTV-to-CAC ratio (to one decimal place)?',
        how: 'LTV = monthly payment × gross margin × months; ratio = LTV ÷ CAC. Investors like to see 3× or more.',
      },
      dilution: {
        name: 'Dilution',
        q: 'You own {{own}} of your startup. An investor puts in {{invest}} at a pre-money valuation of {{pre}}. What do you own after the round (to one decimal place)?',
        how: 'New stake = old stake × pre-money ÷ post-money, where post-money = pre-money + investment.',
      },
      evMultiple: {
        name: 'Valuation by multiple',
        q: 'A company makes EBITDA of {{ebitda}}. Similar companies sell for {{multiple}}× EBITDA. It has {{debt}} of debt and {{cash}} of cash. What is its equity worth?',
        how: 'Enterprise value = EBITDA × multiple. Equity value = enterprise value − debt + cash.',
      },
      dcfPerpetuity: {
        name: 'DCF with growth',
        q: 'Next year a company will generate free cash flow of {{fcf}}, growing {{g}} a year forever. Its cost of capital is {{r}}. What is its enterprise value?',
        how: 'Value = next year’s free cash flow ÷ (cost of capital − growth).',
      },
      convertible: {
        name: 'Convertible note',
        q: 'A {{note}} convertible note converts at a {{discount}} discount to the next round’s price of {{price}} per share. How many shares does the investor get (to the nearest share)?',
        how: 'Conversion price = round price × (1 − discount); shares = note ÷ conversion price.',
      },
      twoStageDcf: {
        name: 'Two-stage DCF',
        q: 'Free cash flow is {{fcf}} this year. It will grow {{g1}} a year for the next three years, then {{g2}} a year forever. The cost of capital is {{r}}. What is the enterprise value today (to the nearest dollar)?',
        how: 'Discount the cash flows of years 1–3, then add the terminal value at year 3 = FCF₃ × (1 + g₂) ÷ (r − g₂), discounted three years.',
      },
    },
  },
  charts: {
    cash: 'Cash',
    value: 'Company value',
    goal: 'Goal',
    month: 'Month {{n}}',
    quarter: 'Q{{n}}',
    day: 'Day {{n}}',
    week: 'Week {{n}}',
    portfolio: 'Your portfolio',
    index: 'Index fund',
    revenue: 'Revenue',
    costs: 'Total costs',
    profit: 'Profit',
    customers: 'Customers',
    price: 'Price',
    units: 'Units',
    breakEven: 'Break-even',
    demand: 'Demand',
    yourPrice: 'Your price',
    allocation: 'Allocation',
    needs: 'Needs',
    wants: 'Wants',
    savings: 'Savings',
    chartA11y: '{{title}}: {{summary}}',
  },
};
export default en;
