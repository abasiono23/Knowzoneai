/**
 * The Business words added with the ten-level ladder, in every language, added to the "business"
 * namespace at start-up (so components use the usual t()). English is business-text.en.ts; the others are
 * generated from it by apps/server/scripts/business-history-content.ts --stages text (placeholders
 * checked in code). Do not edit the translations here by hand: edit the English and run the stage.
 */
import i18n from 'i18next';

import en from './business-text.en';

export const BUSINESS_TEXT = { en, ...{
 "pcm": {
  "games": {
   "startup-tycoon": {
    "tagline": "Run one company month by month, den value am like analyst.",
    "rules": {
     "r1": "Every month, pick your team, your marketing and one answer to one management wahala. Server go run the month and send your profit and loss.",
     "r2": "Grow the company value reach the goal before cash finish. One bad decision or bankruptcy go cost you one heart.",
     "r3": "From Beginner, the analyst desk at the end go ask about your numbers: margins, runway, and at the top dilution and DCF valuation.",
     "example": "Revenue $9,000 − cost of sales $3,000 = gross profit $6,000; after $5,200 of payroll and rent, the month made $800."
    }
   },
   "budget-master": {
    "tagline": "Plan every dollar, from pocket money to paying off debt.",
    "rules": {
     "r1": "Every month, pay the bills, den share the rest: food, fun, clothes, emergency fund, savings goal and extra debt payments. Every dollar must get work.",
     "r2": "Den something happen: choose how you go handle am. Skip food or bad choice go cost you one heart.",
     "r3": "Higher levels bring rent, card debt with interest and irregular pay; the analyst desk go ask about interest, loans, tax and saving for retirement.",
     "example": "$400 pocket money: $60 bills, $80 food, $40 fun, $220 saved (55%)."
    }
   },
   "market-master": {
    "tagline": "Price one market stall, den read markets like economist.",
    "rules": {
     "r1": "Every day, set your price and how much stock to buy. Weather, crowd and rival go change how many customers come.",
     "r2": "Unsold stock dey waste and loss go cost you one heart. The closer you reach best profit, the more points.",
     "r3": "Market research go fade from Upper-intermediate; the analyst desk go from revenue to elasticity, monopoly, concentration and Cournot competition.",
     "example": "60 cups sold at $1.50 na $90 revenue; with 70 cups bought at $0.50 and $10 fee, profit na $45."
    }
   },
   "profit-quest": {
    "tagline": "Master the maths of profit, den run one factory week by week.",
    "rules": {
     "r1": "Business maths and factory weeks dey take turns. Work out each sum, den choose one answer.",
     "r2": "In factory week, set the price and how many to make; leftovers go cost storage. Loss go cost you one heart.",
     "r3": "The sums go climb from contribution and break-even to operating leverage, NPV and cost of capital, with shorter clock.",
     "example": "Price $40, cost to make $25: each sale dey contribute $15. Fixed costs of $1,500 need 100 sales to break even."
    }
   },
   "market-simulator": {
    "tagline": "Invest practice money and learn risk, return and valuation.",
    "rules": {
     "r1": "Every quarter, read news and split your money between cash, bonds, index fund and made-up companies (e must add up to 100%).",
     "r2": "Answer the quarter investing question. Beating index and spreading risk dey earn points; wrong answer go cost you one heart.",
     "r3": "Fees and limits on one company go arrive at Upper-intermediate; the analyst desk go reach CAPM, bond prices and portfolio risk.",
     "example": "60% in index fund wey rise 5% and 40% in bonds wey rise 1%: the portfolio rise 3.4%."
    }
   }
  },
  "analyst": {
   "eyebrow": "ANALYST DESK",
   "step": "Question {{n}} of {{total}}",
   "intro": "Work am out on paper or with calculator, den choose.",
   "check": "Check answer",
   "right": "Correct",
   "wrong": "Not quite",
   "answerWas": "The answer na {{answer}}.",
   "timeUp": "Time don up",
   "method": "METHOD",
   "next": "Next",
   "review": "Analyst desk",
   "kinds": {
    "saveWeeks": {
     "name": "Saving up",
     "q": "You dey save {{weekly}} every week for headphones wey cost {{target}}. How many weeks before you fit buy am?",
     "how": "Weeks = price ÷ weekly saving, round up: part-week still mean wait another week."
    },
    "shareOf": {
     "name": "Share of pay",
     "q": "Your take-home pay na {{income}} a month. How much be {{share}} of am?",
     "how": "Amount = pay × percentage ÷ 100. Di 50/30/20 rule: 50% needs, 30% wants, 20% savings."
    },
    "simpleInterest": {
     "name": "Simple interest",
     "q": "You borrow {{principal}} at {{rate}} simple interest a year for {{years}} years. How much interest you go pay total?",
     "how": "Simple interest = principal × rate × years. Interest dey only charge on the amount you first borrow."
    },
    "cardInterest": {
     "name": "Interest wey card dey charge",
     "q": "Your credit card balance na {{balance}} and di card dey charge {{rate}} interest every month. If you no pay anything, how much interest dem go add dis month?",
     "how": "Monthly interest = balance × monthly rate. If you no pay, dem add am to di balance and e go still earn interest too."
    },
    "compound": {
     "name": "Compound growth",
     "q": "You invest {{principal}} at {{rate}} a year, wey dem compound once a year, for {{years}} years. Wetin e go worth at di end (to di nearest dollar)?",
     "how": "Value = principal × (1 + rate)^years. Interest wey each year bring go still earn interest for di years wey follow."
    },
    "realRate": {
     "name": "Real return",
     "q": "Your savings dey earn {{nominal}} a year while prices dey rise {{inflation}} a year. Wetin be your real return (to one decimal place)?",
     "how": "Real return = (1 + nominal rate) ÷ (1 + inflation) − 1. Nominal minus inflation na only rough estimate."
    },
    "ear": {
     "name": "Effective annual rate",
     "q": "One card dey charge {{monthly}} interest every month, wey dem compound monthly. Wetin be di effective annual rate (to one decimal place)?",
     "how": "Effective annual rate = (1 + monthly rate)^12 − 1. E higher pass 12 × di monthly rate because interest dey compound."
    },
    "loanPayment": {
     "name": "Loan repayment",
     "q": "You borrow {{principal}} at {{rate}} a year, wey you go pay back in equal monthly payments over {{years}} years (interest dey charge monthly). Wetin be di monthly payment?",
     "how": "Payment = P × i ÷ (1 − (1 + i)^−n), wit i = annual rate ÷ 12 and n = number of months."
    },
    "taxBands": {
     "name": "Tax bands",
     "q": "Income: {{income}}. Tax na 0% on di first {{band1}}, {{rate2}} on income from {{band1}} to {{band2}}, and {{rate3}} on everything wey pass {{band2}}. How much tax you go pay in total?",
     "how": "Tax each slice of income at im own rate and add di slices join. Higher band no dey tax di income wey dey below am."
    },
    "retirement": {
     "name": "Saving for retirement",
     "q": "You dey save {{payment}} at di end of every year for {{years}} years at {{rate}} a year. Wetin di pot go worth after di last payment (to di nearest dollar)?",
     "how": "Future value of annuity = payment × ((1 + rate)^years − 1) ÷ rate."
    },
    "revenue": {
     "name": "Revenue",
     "q": "You sell {{qty}} cups at {{price}} each. Each cup cost you {{cost}} to make. Wetin be your revenue?",
     "how": "Revenue = quantity sold × price. Revenue na before any cost; profit na wetin remain after cost."
    },
    "profitDay": {
     "name": "One day profit",
     "q": "You buy {{bought}} items at {{cost}} each and pay {{fee}} stall fee. You sell {{qty}} of dem at {{price}} each, and di rest waste. Wetin be your profit?",
     "how": "Profit = sales × price − everything you buy × im cost − fixed fees. Stock wey no sell still na cost."
    },
    "demandAt": {
     "name": "Reading demand",
     "q": "At {{p1}} you get {{q1}} customers; at {{p2}} you get {{q2}}. Demand dey fall for straight line. How many customers you go get at {{p3}}?",
     "how": "Straight line dey lose same number of customers for every extra dollar: find dat slope, then carry am on."
    },
    "elasticity": {
     "name": "Price elasticity",
     "q": "When price rise from {{p1}} to {{p2}}, sales fall from {{q1}} to {{q2}}. Using di midpoint method, wetin be di price elasticity of demand (as positive number, to two decimal places)?",
     "how": "Elasticity = (change in Q ÷ average Q) ÷ (change in P ÷ average P). Above 1 na elastic; below 1 na inelastic."
    },
    "bestPrice": {
     "name": "Di best price",
     "q": "Customers a day = {{a}} − {{b}} × price, and each item cost you {{cost}}. Which price go make di most profit?",
     "how": "With straight-line demand, di price wey maximise profit na halfway between di cost and di price wey nobody go buy: (a ÷ b + cost) ÷ 2."
    },
    "monopolyQ": {
     "name": "Monopoly output",
     "q": "One monopoly dey face demand curve P = {{A}} − {{B}}Q and e get constant marginal cost of {{mc}}. Which quantity go maximise im profit (to one decimal place)?",
     "how": "Set marginal revenue equal to marginal cost: MR = A − 2BQ, so Q = (A − MC) ÷ 2B."
    },
    "hhi": {
     "name": "Market concentration",
     "q": "Di {{firms}} firms for one market get shares of {{shares}}. Wetin be di Herfindahl–Hirschman Index (HHI)?",
     "how": "HHI = di sum of every firm market share wey dem square (in %). Above 2,500 dem dey usually treat am as highly concentrated."
    },
    "cournot": {
     "name": "Duopoly (Cournot)",
     "q": "Two identical firms dey compete on quantity. Market demand na P = {{A}} − {{B}}(q₁ + q₂) and each get constant marginal cost of {{mc}}. For di Cournot equilibrium, how much each firm go produce (to one decimal place)?",
     "how": "Each firm best response na q = (A − MC − Bq_other) ÷ 2B; with identical firms, q = (A − MC) ÷ 3B."
    },
    "deadweight": {
     "name": "Deadweight loss",
     "q": "A monopoly dey face P = {{A}} − {{B}}Q with constant marginal cost of {{mc}}. Compared with perfect competition, wetin be di deadweight loss (to di nearest dollar)?",
     "how": "Monopoly dey make Q = (A − MC) ÷ 2B, half di competitive Q = (A − MC) ÷ B. Di lost triangle na (A − MC)² ÷ 8B."
    },
    "operatingLeverage": {
     "name": "Operating leverage",
     "q": "You dey sell {{units}} units at {{price}}; each one cost {{unit}} to make, and fixed costs na {{fixed}}. Wetin be di degree of operating leverage (to two decimal places)?",
     "how": "DOL = total contribution ÷ operating profit. DOL of 3 mean say 1% change in sales dey move profit by about 3%."
    },
    "npv": {
     "name": "Net present value",
     "q": "A machine cost {{cost}} today and e go bring in {{cash}} at di end of each year for {{years}} years. At {{rate}} discount rate, wetin be im NPV (to di nearest dollar)?",
     "how": "NPV = cash × (1 − (1 + r)^−years) ÷ r − cost. Invest when NPV positive."
    },
    "wacc": {
     "name": "Cost of capital",
     "q": "A company get {{equity}} of equity wey cost {{re}} and {{debt}} of debt wey cost {{rd}} before tax. Tax rate na {{tax}}. Wetin be im WACC (to two decimal places)?",
     "how": "WACC = E ÷ V × cost of equity + D ÷ V × cost of debt × (1 − tax), where V = E + D. Interest dey tax-deductible."
    },
    "projectNpv": {
     "name": "Project appraisal",
     "q": "A company with {{equity}} of equity (cost {{re}}) and {{debt}} of debt (cost {{rd}} before tax, tax rate {{tax}}) dey consider a project wey cost {{cost}} and go return {{cash}} at di end of each year for {{years}} years. Discounted at di company WACC, wetin be di project NPV (to di nearest dollar)?",
     "how": "First di WACC = E ÷ V × re + D ÷ V × rd × (1 − tax); then NPV = cash × (1 − (1 + WACC)^−years) ÷ WACC − cost."
    },
    "dividendYield": {
     "name": "Dividend yield",
     "q": "A share cost {{price}} and e dey pay dividend of {{dividend}} a year. Wetin be im dividend yield (to one decimal place)?",
     "how": "Dividend yield = yearly dividend ÷ share price × 100."
    },
    "portfolioReturn": {
     "name": "Portfolio return",
     "q": "You hold {{w1}} of your money in a fund wey return {{r1}} and {{w2}} in one wey return {{r2}}. Wetin your whole portfolio return?",
     "how": "Portfolio return = each holding weight × im return, add dem up."
    },
    "peValue": {
     "name": "Price from P/E",
     "q": "A company dey earn {{eps}} per share. Similar companies dey trade at price/earnings ratio of {{pe}}. Wetin share price dat suggest?",
     "how": "Price = earnings per share × P/E ratio."
    },
    "capm": {
     "name": "CAPM",
     "q": "Risk-free rate na {{rf}}, market expected to return {{rm}}, and a share get beta of {{beta}}. Using CAPM, wetin return investors suppose expect (to one decimal place)?",
     "how": "Expected return = risk-free rate + beta × (market return − risk-free rate)."
    },
    "sharpe": {
     "name": "Sharpe ratio",
     "q": "A fund return {{rp}} with standard deviation of {{sd}}; risk-free rate na {{rf}}. Wetin be im Sharpe ratio (to two decimal places)?",
     "how": "Sharpe ratio = (return − risk-free rate) ÷ standard deviation: di extra return you earn for each unit of risk."
    },
    "gordon": {
     "name": "Dividend discount model",
     "q": "A share just pay dividend of {{d0}}. Dividends dey grow {{g}} a year forever and investors require {{r}}. Wetin di share worth (Gordon growth model)?",
     "how": "Value = next year dividend ÷ (required return − growth) = D₀ × (1 + g) ÷ (r − g)."
    },
    "bondPrice": {
     "name": "Bond price",
     "q": "A bond with face value of {{face}} dey pay {{coupon}} coupon once a year and e mature in {{years}} years. If market yield na {{y}}, wetin be im price?",
     "how": "Price = di coupons discounted as annuity + face value ÷ (1 + yield)^years. Prices dey fall when yields rise."
    },
    "twoAssetSd": {
     "name": "Portfolio risk",
     "q": "You put {{w1}} in asset A (standard deviation {{s1}}) and {{w2}} in asset B (standard deviation {{s2}}). Their correlation na {{rho}}. Wetin be di portfolio standard deviation (to one decimal place)?",
     "how": "σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). Below correlation of 1, mixing assets dey lower risk: diversification."
    },
    "grossMargin": {
     "name": "Gross margin",
     "q": "You dey sell a product for {{price}}. E cost {{unit}} to make and deliver. Wetin be your gross margin (to one decimal place)?",
     "how": "Gross margin = (price − cost of di sale) ÷ price × 100."
    },
    "runway": {
     "name": "Runway",
     "q": "A startup get {{cash}} in di bank. E dey bring in {{revenue}} a month and dey spend {{costs}} a month. For how many whole months e go fit continue?",
     "how": "Runway = cash ÷ monthly burn, where burn = costs − revenue. Round down: di last part-month no dey covered."
    },
    "ltvCac": {
     "name": "LTV : CAC",
     "q": "A customer dey pay {{monthly}} every month with {{gm}} gross margin and e dey stay {{months}} months on average. To win each customer cost {{cac}}. Wetin be the LTV-to-CAC ratio (to one decimal place)?",
     "how": "LTV = monthly payment × gross margin × months; ratio = LTV ÷ CAC. Investors like to see 3× or more."
    },
    "dilution": {
     "name": "Dilution",
     "q": "You own {{own}} of your startup. An investor put {{invest}} at pre-money valuation of {{pre}}. Wetin you own after the round (to one decimal place)?",
     "how": "New stake = old stake × pre-money ÷ post-money, where post-money = pre-money + investment."
    },
    "evMultiple": {
     "name": "Valuation by multiple",
     "q": "A company dey make EBITDA of {{ebitda}}. Similar companies dey sell for {{multiple}}× EBITDA. E get {{debt}} of debt and {{cash}} of cash. Wetin be the worth of its equity?",
     "how": "Enterprise value = EBITDA × multiple. Equity value = enterprise value − debt + cash."
    },
    "dcfPerpetuity": {
     "name": "DCF with growth",
     "q": "Next year a company go generate free cash flow of {{fcf}}, wey go grow {{g}} a year forever. Its cost of capital na {{r}}. Wetin be its enterprise value?",
     "how": "Value = next year’s free cash flow ÷ (cost of capital − growth)."
    },
    "convertible": {
     "name": "Convertible note",
     "q": "A {{note}} convertible note dey convert at {{discount}} discount to the next round’s price of {{price}} per share. How many shares the investor go get (to the nearest share)?",
     "how": "Conversion price = round price × (1 − discount); shares = note ÷ conversion price."
    },
    "twoStageDcf": {
     "name": "Two-stage DCF",
     "q": "Free cash flow na {{fcf}} this year. E go grow {{g1}} a year for the next three years, then {{g2}} a year forever. The cost of capital na {{r}}. Wetin be the enterprise value today (to the nearest dollar)?",
     "how": "Discount the cash flows of years 1–3, then add the terminal value at year 3 = FCF₃ × (1 + g₂) ÷ (r − g₂), discounted three years."
    }
   }
  },
  "charts": {
   "cash": "Cash",
   "value": "Company value",
   "goal": "Goal",
   "month": "Month {{n}}",
   "quarter": "Q{{n}}",
   "day": "Day {{n}}",
   "week": "Week {{n}}",
   "portfolio": "Your portfolio",
   "index": "Index fund",
   "revenue": "Revenue",
   "costs": "Total costs",
   "profit": "Profit",
   "customers": "Customers",
   "price": "Price",
   "units": "Units",
   "breakEven": "Break-even",
   "demand": "Demand",
   "yourPrice": "Your price",
   "allocation": "Allocation",
   "needs": "Needs",
   "wants": "Wants",
   "savings": "Savings",
   "chartA11y": "{{title}}: {{summary}}"
  }
 },
 "yo": {
  "games": {
   "startup-tycoon": {
    "tagline": "Ṣakoso ilé-iṣẹ́ lóṣooṣù, kí o sì díwọ̀n iye rẹ̀ bí olùṣàyẹ̀wò.",
    "rules": {
     "r1": "Lóṣooṣù, yan ẹgbẹ́ rẹ, ìpolówó rẹ àti ìdáhùn sí ìṣòro ìṣàkóso. Sáfà máa ṣe oṣù náà, kí ó sì fi èrè àti òfò rẹ ránṣẹ́.",
     "r2": "Mú iye ilé-iṣẹ́ náà pọ̀ sí ibi àfojúsùn láìsí pé owó rẹ tán. Ìpinnu búburú tàbí ìdíwọ́ máa ná ọkàn kan.",
     "r3": "Láti Ìbẹ̀rẹ̀, tábìlì olùṣàyẹ̀wò ní ìparí máa béèrè nípa àwọn nọ́mbà rẹ: èrè, ìgbà tí owó máa gbé, àti ní ìpele gíga ìdàpọ̀ àti ìdíwọ̀n DCF.",
     "example": "Owó tí ó wọlé $9,000 − iye ìná $3,000 = èrè àpapọ̀ $6,000; lẹ́yìn $5,200 owó oṣìṣẹ́ àti ìyá ilé, oṣù náà jẹ́rè $800."
    }
   },
   "budget-master": {
    "tagline": "Ṣètò gbogbo dọ́là, láti owó àpò dé sísan gbèsè.",
    "rules": {
     "r1": "Lóṣooṣù, san àwọn ìwé-ìná, kí o sì pín èyí tí ó kù: oúnjẹ, eré, aṣọ, owó ìpàdé pàjáwìrì, àfojúsùn ìfowópamọ́ àti owó gbèsè àfikún. Gbogbo dọ́là gbọ́dọ̀ ní iṣẹ́.",
     "r2": "Lẹ́yìn náà ohun kan máa ṣẹlẹ̀: yan bí o máa ṣe é. Fífi oúnjẹ sílẹ̀ tàbí ìpinnu búburú máa ná ọkàn kan.",
     "r3": "Àwọn ìpele gíga máa mú ìyá ilé, gbèsè káàdì pẹ̀lú èlé àti owó tí kò dé lóṣù; tábìlì olùṣàyẹ̀wò máa béèrè nípa èlé, àwìn, owó orí àti ìfowópamọ́ fún ìfẹ̀yìntì.",
     "example": "$400 owó àpò: $60 ìwé-ìná, $80 fún oúnjẹ, $40 fún eré, $220 fowópamọ́ (55%)."
    }
   },
   "market-master": {
    "tagline": "Díwọ̀n ibi ọjà, kí o sì ka ọjà bí onímọ̀-ọ̀rọ̀-ajé.",
    "rules": {
     "r1": "Lójoojúmọ́, ṣètò iye rẹ àti iye ọjà tí o máa rà. Ojú-ọjọ́, èrò àti alátakò máa yí iye àwọn oníbàárà padà.",
     "r2": "Ọjà tí kò tà máa bàjẹ́, òfò sì máa ná ọkàn kan. Bí o bá sún mọ́ èrè tí ó dára jù, bẹ́ẹ̀ ni o máa gba àmì púpọ̀.",
     "r3": "Ìwádìí ọjà ń pòórá láti Àárín-gíga; tábìlì olùṣàyẹ̀wò lọ láti owó tí ń wọlé sí ìrọ̀sí, àdáṣe, ìkójọpọ̀ àti ìdíje Cournot.",
     "example": "60 ife tí a tà ní $1.50 jẹ́ $90 owó tí ó wọlé; pẹ̀lú 70 ife tí a rà ní $0.50 àti owó $10, èrè jẹ́ $45."
    }
   },
   "profit-quest": {
    "tagline": "Kọ́ ìṣirò èrè, kí o sì ṣakoso ilé-iṣẹ́ lọ́sọ̀ọ̀sẹ̀.",
    "rules": {
     "r1": "Ìṣirò ìṣòwò àti àwọn ọ̀sẹ̀ ilé-iṣẹ́ máa yí padà. Ṣe ìṣirò kọ̀ọ̀kan, kí o sì yan ìdáhùn.",
     "r2": "Nínú ọ̀sẹ̀ ilé-iṣẹ́, ṣètò iye àti iye tí a máa ṣe; ọjà tí ó kù máa ná owó ìpamọ́. Òfò máa ná ọkàn kan.",
     "r3": "Àwọn ìṣirò ń gòkè láti ìdásí àti ààlà ìdọ́gba sí agbára ìṣiṣẹ́, NPV àti iye owó àkójọpọ̀, pẹ̀lú aago kúkúrú.",
     "example": "Iye $40, iye ìṣe $25: ọ̀kọ̀ọ̀kan tàtà ń dá $15. Àwọn iye ìdúró $1,500 nílò ìtà 100 láti dé ààlà ìdọ́gba."
    }
   },
   "market-simulator": {
    "tagline": "Fi owó ìdánrawò ṣe ìdókòwò, kí o sì kọ́ nípa ewu, èrè àti ìdíwọ̀n.",
    "rules": {
     "r1": "Lẹ́ẹ̀kọ̀ọ̀kan, ka ìròyìn, kí o sì pín owó rẹ láàrin owó, bọ́ndì, àpò ìtọ́kasí àti àwọn ilé-iṣẹ́ àròyé (ó gbọ́dọ̀ dà 100%).",
     "r2": "Dáhùn ìbéèrè ìdókòwò ti ìdásẹ́ náà. Ṣíṣe ju àpò ìtọ́kasí lọ àti pínpín ewu máa ń gba àmì; ìdáhùn tí kò tọ́ máa ná ọkàn kan.",
     "r3": "Owó ìsanwó àti ààlà lórí ilé-iṣẹ́ kan máa dé ní Ìpele Àárín Gíga; tábìlì olùṣàyẹ̀wò máa gòkè dé CAPM, iye bọ́ndì àti ewu àpò.",
     "example": "60% nínú àpò ìtọ́kasí tí ó gòkè 5% àti 40% nínú bọ́ndì tí ó gòkè 1%: àpò náà gòkè 3.4%."
    }
   }
  },
  "analyst": {
   "eyebrow": "TÁBÌLÌ OLÙṢÀYẸ̀WÒ",
   "step": "Ìbéèrè {{n}} nínú {{total}}",
   "intro": "Ṣe é lórí bébà tàbí pẹ̀lú ẹ̀rọ ìṣirò, kí o sì yan.",
   "check": "Ṣàyẹ̀wò ìdáhùn",
   "right": "Tọ́",
   "wrong": "Kò tọ́ pátápátá",
   "answerWas": "Ìdáhùn ni {{answer}}.",
   "timeUp": "Àkókò tán",
   "method": "Ọ̀NÀ",
   "next": "Tókàn",
   "review": "Tábìlì olùṣàyẹ̀wò",
   "kinds": {
    "saveWeeks": {
     "name": "Ìfowópamọ́",
     "q": "O máa ń fi {{weekly}} pamọ́ lọ́sọ̀ọ̀sẹ̀ fún agbekọ́rùn tí iye rẹ̀ jẹ́ {{target}}. Ọ̀sẹ̀ mélòó kí o tó lè rà á?",
     "how": "Ọ̀sẹ̀ = iye ÷ ìfowópamọ́ lọ́sọ̀ọ̀sẹ̀, tí a yí sókè: ìpín ọ̀sẹ̀ kan ṣì túmọ̀ sí dídúró ọ̀sẹ̀ mìíràn."
    },
    "shareOf": {
     "name": "Ìpín owó tí ó wọlé",
     "q": "Owó tí ó wọlé rẹ lẹ́yìn orí jẹ́ {{income}} lóṣù. Elòó ni {{share}} nínú rẹ̀?",
     "how": "Iye = owó tí ó wọlé × ìpín-ọgọ́rùn-ún ÷ 100. Òfin 50/30/20: 50% àìní, 30% ìfẹ́, 20% ìfowópamọ́."
    },
    "simpleInterest": {
     "name": "Èlé rọ̀rùn",
     "q": "O yá {{principal}} ní èlé rọ̀rùn {{rate}} lọ́dún fún ọdún {{years}}. Elòó ni èlé tí o máa san lápapọ̀?",
     "how": "Èlé rọ̀rùn = owó àkọ́kọ́ × ìpín-ọgọ́rùn-ún × ọdún. Èlé máa ń wá lórí iye tí a kọ́kọ́ yá nìkan."
    },
    "cardInterest": {
     "name": "Èlé káàdì",
     "q": "Ìwọ̀ntúnwọ̀nsì káàdì rẹ jẹ́ {{balance}}, káàdì náà sì ń gba èlé {{rate}} lósù. Tí o kò bá san kankan, èlé mélòó ni wọ́n ń fi kún oṣù yìí?",
     "how": "Èlé oṣù = ìwọ̀ntúnwọ̀nsì × ìwọ̀n oṣù. Tí a kò bá san, wọ́n ń fi kún ìwọ̀ntúnwọ̀nsì, ó sì ń gba èlé pẹ̀lú."
    },
    "compound": {
     "name": "Ìdàgbàsókè àpapọ̀",
     "q": "O fi {{principal}} ṣe ìdókòwò ní {{rate}} lọ́dún, tí a ń ṣe àpapọ̀ lẹ́ẹ̀kan lọ́dún, fún {{years}} ọdún. Kí ni yóò jẹ́ ní ìparí (sí dọ́là tó súnmọ́ nhất)?",
     "how": "Iye = owó ìpilẹ̀ × (1 + ìwọ̀n)^ọdún. Èrè ọdún kọ̀ọ̀kan ń gba èrè ní àwọn ọdún tó ń bọ̀."
    },
    "realRate": {
     "name": "Èrè gidi",
     "q": "Ìṣúra rẹ ń gba {{nominal}} lọ́dún nígbà tí iye àwọn nǹkan ń ga {{inflation}} lọ́dún. Kí ni èrè gidi rẹ (sí ìpín kan nínú mẹ́wàá)?",
     "how": "Èrè gidi = (1 + ìwọ̀n àpèjúwe) ÷ (1 + ìwọ̀n ìdàgbàsókè) − 1. Ìwọ̀n àpèjúwe yọ ìwọ̀n ìdàgbàsókè kì í ṣe àfojúsùn péré."
    },
    "ear": {
     "name": "Ìwọ̀n ọdún tó wúlò",
     "q": "Káàdì kan ń gba èlé {{monthly}} lósù, tí a ń ṣe àpapọ̀ lóṣooṣù. Kí ni ìwọ̀n ọdún tó wúlò (sí ìpín kan nínú mẹ́wàá)?",
     "how": "Ìwọ̀n ọdún tó gbéṣẹ́ = (1 + ìwọ̀n oṣù)^12 − 1. Ó ga ju 12 × ìwọ̀n oṣù nítorí èrè ń ṣe àkójọpọ̀."
    },
    "loanPayment": {
     "name": "Ìsan gbèsè",
     "q": "O yá {{principal}} ní {{rate}} lọ́dún, tí a ó san ní ìsan oṣù tó dọ́gba fún {{years}} ọdún (a ń gba èlé lóṣooṣù). Kí ni ìsan oṣù?",
     "how": "Ìsan = P × i ÷ (1 − (1 + i)^−n), pẹ̀lú i = ìwọ̀n ọdún ÷ 12 àti n = iye oṣù."
    },
    "taxBands": {
     "name": "Àwọn ìpele owó orí",
     "q": "Owó tí ń wọlé: {{income}}. Owó orí jẹ́ 0% lórí {{band1}} àkọ́kọ́, {{rate2}} lórí owó tí ń wọlé láti {{band1}} dé {{band2}}, àti {{rate3}} lórí gbogbo ohun tó ju {{band2}} lọ. Iye owó orí mélòó ni a gbà lápapọ̀?",
     "how": "Gba owó orí lórí ìpín kọ̀ọ̀kan owó tí ń wọlé ní ìwọ̀n tirẹ̀, kí o sì rò wọ́n pọ̀. Ìpele tó ga kò ní gba owó orí lórí owó tó wà nísàlẹ̀ rẹ̀."
    },
    "retirement": {
     "name": "Ìṣúra fún ìfẹ̀yìntì",
     "q": "O ń ṣúra {{payment}} ní ìparí ọdún kọ̀ọ̀kan fún {{years}} ọdún ní {{rate}} lọ́dún. Kí ni ikoko náà jẹ́ ní ìparí ìsan tó kẹ́yìn (sí dọ́là tó súnmọ́ nhất)?",
     "how": "Iye ọjọ́ iwájú annuity = payment × ((1 + rate)^years − 1) ÷ rate."
    },
    "revenue": {
     "name": "Owó tí ń wọlé",
     "q": "O ń ta {{qty}} ife ní {{price}} kọ̀ọ̀kan. Ìdí {{cost}} ni ó ná ọ fún ife kọ̀ọ̀kan. Kí ni owó tí ń wọlé rẹ?",
     "how": "Owó tí ń wọlé = iye tí a tà × iye owó. Owó tí ń wọlé wà kí a tó yọ àwọn ìnáwó kúrò; èrè ni ohun tó kù lẹ́yìn wọn."
    },
    "profitDay": {
     "name": "Èrè ọjọ́ kan",
     "q": "O ra {{bought}} nǹkan ní {{cost}} kọ̀ọ̀kan, o sì san {{fee}} owó ibùdó. O ta {{qty}} nínú wọn ní {{price}} kọ̀ọ̀kan, àwọn tó kù sì di àdàánù. Kí ni èrè rẹ?",
     "how": "Èrè = ìtà × iye − gbogbo ohun tí o ra × iye rẹ̀ − àwọn owó ìdúró. Ọjà tí a kò tà ṣì jẹ́ ìnáwó."
    },
    "demandAt": {
     "name": "Kíkà ìbéèrè",
     "q": "Ní {{p1}} o ní {{q1}} àwọn oníbàárà; ní {{p2}} o ní {{q2}}. Ìbéèrè ń dín kù ní ìlà tààrà. Àwọn oníbàárà mélòó ni wàá ní ní {{p3}}?",
     "how": "Ìlà tààrà ń pàdánù iye oníbàárà kan náà fún dọ́là kọ̀ọ̀kan tó fi kún: wá ìwọ̀n ìdàgbàsókè yẹn, kí o sì tẹ̀síwájú pẹ̀lú rẹ̀."
    },
    "elasticity": {
     "name": "Elasticity iye owó",
     "q": "Nígbà tí iye owó ga láti {{p1}} dé {{p2}}, ìtà dín kù láti {{q1}} dé {{q2}}. Ní lílo ọ̀nà àárín, kí ni elasticity iye owó ti ìbéèrè (gẹ́gẹ́ bí nọ́mbà rere, sí ìpín méjì nínú ọgọ́rùn-ún)?",
     "how": "Ìrọ̀rùn = (ìyípadà Q ÷ Q àpapọ̀) ÷ (ìyípadà P ÷ P àpapọ̀). Ju 1 lọ jẹ́ rírọ̀; kéré ju 1 lọ kò rọ̀."
    },
    "bestPrice": {
     "name": "Iye owó tó dára jù",
     "q": "Àwọn oníbàárà lójúmọ́ = {{a}} − {{b}} × iye, àti ọ̀kọ̀ọ̀kan nkan ń ná ọ {{cost}}. Iye wo ni ó ń mú èrè púpọ̀ jù?",
     "how": "Pẹ̀lú ìbéèrè tààrà, iye tó ń mú èrè púpọ̀ jù wà ní àárín iye ìnáwó àti iye tí ẹnikẹ́ni kò fi ra: (a ÷ b + cost) ÷ 2."
    },
    "monopolyQ": {
     "name": "Ìjáde monopoly",
     "q": "Àṣẹ́wọ́ kan ṣoṣo dojú kọ ìlà ìbéèrè P = {{A}} − {{B}}Q ó sì ní iye ìnáwó àfikún kan ṣoṣo {{mc}}. Iye wo ni ó ń mú èrè rẹ̀ púpọ̀ jù (sí ibi kan lẹ́yìn àmì)?",
     "how": "Fi owó tí ń wọlé àfikún dọ́gba pẹ̀lú iye ìnáwó àfikún: MR = A − 2BQ, nítorí náà Q = (A − MC) ÷ 2B."
    },
    "hhi": {
     "name": "Ìkójọpọ̀ ọjà",
     "q": "Àwọn {{firms}} ilé-iṣẹ́ nínú ọjà kan ní àwọn ìpín {{shares}}. Kí ni Herfindahl–Hirschman Index (HHI)?",
     "how": "HHI = àpapọ̀ ìpín ọjà oníṣe kọ̀ọ̀kan ní ìlọ́po méjì (ní %). Ju 2,500 lọ ni a sábà kà sí ìkójọpọ̀ gíga."
    },
    "cournot": {
     "name": "Duopoly (Cournot)",
     "q": "Àwọn ilé-iṣẹ́ méjì tó dọ́gba ń díje lórí iye. Ìbéèrè ọjà ni P = {{A}} − {{B}}(q₁ + q₂) àti ọ̀kọ̀ọ̀kan ní iye ìnáwó àfikún {{mc}}. Nínú ìdọ́gba Cournot, iye wo ni ilé-iṣẹ́ kọ̀ọ̀kan ń ṣe (sí ibi kan lẹ́yìn àmì)?",
     "how": "Ìdáhùn tó dára jù ti ilé-iṣẹ́ kọ̀ọ̀kan ni q = (A − MC − Bq_other) ÷ 2B; pẹ̀lú àwọn ilé-iṣẹ́ tó dọ́gba, q = (A − MC) ÷ 3B."
    },
    "deadweight": {
     "name": "Àdánù àìní-ṣeéṣe",
     "q": "Ẹ̀ka-ìṣàkóso kan dojú kọ P = {{A}} − {{B}}Q pẹ̀lú iye owó ààlà ìgbẹ̀yìn tí ó dúró ṣinṣin ti {{mc}}. Ní ìfiwéra pẹ̀lú ìdíje pípé, kí ni àdánù àìní-ṣeéṣe (sí dọ́là tí ó súnmọ́ jùlọ)?",
     "how": "Ẹ̀ka-ìṣàkóso ń ṣe Q = (A − MC) ÷ 2B, ìlàjì Q ìdíje = (A − MC) ÷ B. Onígun mẹ́ta tí ó sọnù ni (A − MC)² ÷ 8B."
    },
    "operatingLeverage": {
     "name": "Agbára ìṣiṣẹ́",
     "q": "O ń ta {{units}} ẹ̀yà ní {{price}}; ọ̀kọ̀ọ̀kan ná {{unit}} láti ṣe, àwọn owó tí ó dúró ṣinṣin sì jẹ́ {{fixed}}. Kí ni ìwọ̀n agbára ìṣiṣẹ́ (sí ìpín mẹ́wàá méjì)?",
     "how": "DOL = àpapọ̀ ìṣèdí ÷ èrè ìṣiṣẹ́. DOL 3 túmọ̀ sí ìyípadà 1% nínú títà ń yí èrè padà ní nǹkan bí 3%."
    },
    "npv": {
     "name": "Iye ìsinsìnyí àpapọ̀",
     "q": "Ẹ̀rọ kan ná {{cost}} lónìí ó sì ń mú {{cash}} wá ní ìparí ọdún kọ̀ọ̀kan fún {{years}} ọdún. Ní ìwọ̀n ìdínkù {{rate}}, kí ni NPV rẹ̀ (sí dọ́là tí ó súnmọ́ jùlọ)?",
     "how": "NPV = owó × (1 − (1 + r)^−ọdún) ÷ r − ìnáwó. Ṣe ìdókòwò nígbà tí NPV bá jẹ́ rere."
    },
    "wacc": {
     "name": "Iye owó ààlà",
     "q": "Ilé-iṣẹ́ kan ní {{equity}} ti ìdókòwò onílé tí ó ná {{re}} àti {{debt}} ti gbèsè tí ó ná {{rd}} kí ó tó owó-orí. Ìwọ̀n owó-orí ni {{tax}}. Kí ni WACC rẹ̀ (sí ìpín mẹ́wàá méjì)?",
     "how": "WACC = E ÷ V × iye owó onílé + D ÷ V × iye owó gbèsè × (1 − tax), níbi tí V = E + D. A ń yọ owó-orí kúrò nínú èlé."
    },
    "projectNpv": {
     "name": "Ìgbéléwọ̀n iṣẹ́",
     "q": "Ilé-iṣẹ́ kan tí ó ní {{equity}} ti ìdókòwò onílé (iye {{re}}) àti {{debt}} ti gbèsè (iye {{rd}} kí ó tó owó-orí, ìwọ̀n owó-orí {{tax}}) ń gbèrò iṣẹ́ kan tí ó ná {{cost}} tí yóò mú {{cash}} wá ní ìparí ọdún kọ̀ọ̀kan fún {{years}} ọdún. Ní ìdínkù pẹ̀lú WACC ilé-iṣẹ́, kí ni NPV iṣẹ́ náà (sí dọ́là tí ó súnmọ́ jùlọ)?",
     "how": "Lákọ̀ọ́kọ́ WACC = E ÷ V × re + D ÷ V × rd × (1 − owó orí); lẹ́yìn náà NPV = owó × (1 − (1 + WACC)^−ọdún) ÷ WACC − ìnáwó."
    },
    "dividendYield": {
     "name": "Èrè ìpín",
     "q": "Ìpín kan ná {{price}} ó sì ń san èrè ìpín {{dividend}} lọ́dún. Kí ni èrè ìpín rẹ̀ (sí ìpín mẹ́wàá kan)?",
     "how": "Èrè ìpín = èrè ìpín ọdún ÷ iye ìpín × 100."
    },
    "portfolioReturn": {
     "name": "Èrè àkójọ ìdókòwò",
     "q": "O ní {{w1}} nínú owó rẹ nínú àpò tí ó padà {{r1}} àti {{w2}} nínú ọ̀kan tí ó padà {{r2}}. Kí ni gbogbo àkójọ ìdókòwò rẹ padà?",
     "how": "Èrè àkójọ ìdókòwò = ìwọ̀n ọ̀kọ̀ọ̀kan × èrè rẹ̀, ní àpapọ̀."
    },
    "peValue": {
     "name": "Iye láti P/E",
     "q": "Ilé-iṣẹ́ kan ń jèrè {{eps}} lórí ìpín kọ̀ọ̀kan. Àwọn ilé-iṣẹ́ tí ó jọra ń ṣòwò ní ìwọ̀n iye/èrè ti {{pe}}. Iye ìpín wo ni ìyẹn dábàá?",
     "how": "Iye = èrè lórí ìpín × ìwọ̀n P/E."
    },
    "capm": {
     "name": "CAPM",
     "q": "Ìwọ̀n àìléwu ni {{rf}}, a retí pé ọjà yóò padà {{rm}}, ìpín kan sì ní beta {{beta}}. Ní lílo CAPM, èrè wo ni àwọn olùdókòwò yẹ kí wọ́n retí (sí ìpín mẹ́wàá kan)?",
     "how": "Èrè tí a retí = ìwọ̀n àìléwu + beta × (èrè ọjà − ìwọ̀n àìléwu)."
    },
    "sharpe": {
     "name": "Ìwọ̀n Sharpe",
     "q": "Àpò kan padà {{rp}} pẹ̀lú ìyapa ààlà {{sd}}; ìwọ̀n àìléwu ni {{rf}}. Kí ni ìwọ̀n Sharpe rẹ̀ (sí ìpín mẹ́wàá méjì)?",
     "how": "Ìwọ̀n Sharpe = (èrè − ìwọ̀n àìléwu) ÷ ìyapa ààlà: èrè àfikún tí a ń jèrè fún ẹ̀yà ewu kọ̀ọ̀kan."
    },
    "gordon": {
     "name": "Àwòṣe ìdínkù èrè ìpín",
     "q": "Ìpín kan ṣẹ̀ṣẹ̀ san èrè ìpín {{d0}}. Èrè ìpín ń dàgbà {{g}} lọ́dún títí láé àwọn olùdókòwò sì ń béèrè {{r}}. Iye wo ni ìpín náà (àwòṣe ìdàgbàsókè Gordon)?",
     "how": "Iye = èrè ìpín ọdún tó ń bọ̀ ÷ (èrè tí a béèrè − ìdàgbàsókè) = D₀ × (1 + g) ÷ (r − g)."
    },
    "bondPrice": {
     "name": "Iye gbèsè",
     "q": "Bọ́ndì tó ní iye ojú {{face}} ń san kúpọ̀nù {{coupon}} lẹ́ẹ̀kan lọ́dún ó sì ń pọ́n ní {{years}} ọdún. Tí èrè ọjà bá jẹ́ {{y}}, kí ni iye rẹ̀?",
     "how": "Iye = àwọn kúpọ̀nù tí a dín kù gẹ́gẹ́ bí owó ọdún + iye ojú ÷ (1 + èrè)^ọdún. Àwọn iye ń ṣubú nígbà tí èrè bá gòkè."
    },
    "twoAssetSd": {
     "name": "Ewu àkójọ ìdókòwò",
     "q": "O fi {{w1}} sínú dukia A (ìyapa ààlà {{s1}}) àti {{w2}} sínú dukia B (ìyapa ààlà {{s2}}). Ìbáṣepọ̀ wọn ni {{rho}}. Kí ni ìyapa ààlà àkójọ ìdókòwò náà (sí ìpín mẹ́wàá kan)?",
     "how": "σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). Ní ìsàlẹ̀ ìbáṣepọ̀ 1, dídàpọ̀ dukia ń dín ewu kù: ìpínyà ewu."
    },
    "grossMargin": {
     "name": "Èrè àpapọ̀",
     "q": "O ń ta ọjà kan ní {{price}}. Ó ná {{unit}} láti ṣe àti láti fi ránṣẹ́. Kí ni èrè àpapọ̀ rẹ (sí ìpín mẹ́wàá kan)?",
     "how": "Èrè àpapọ̀ = (iye − iye títà) ÷ iye × 100."
    },
    "runway": {
     "name": "Àkókò ìgbà",
     "q": "Ilé-iṣẹ́ tuntun kan ní {{cash}} nínú báńkì. Ó ń mú {{revenue}} wá lóṣù ó sì ń ná {{costs}} lóṣù. Fún ìlàjì oṣù mélòó ni yóò lè tẹ̀síwájú?",
     "how": "Runway = owó ÷ ìnáwó oṣù, níbi tí ìnáwó = àwọn ìnáwó − owó tí ń wọlé. Yí kùnà: apá oṣù tó kẹ́yìn kò ní ìdábòbò."
    },
    "ltvCac": {
     "name": "LTV : CAC",
     "q": "Oníbàárà ń san {{monthly}} lóṣù kan ní {{gm}} èrè àpapọ̀, ó sì ń dúró ní {{months}} oṣù ní àpapọ̀. Ṣíṣe àṣeyọrí fún olùbàárà kọ̀ọ̀kan ń ná {{cac}}. Kí ni ìpín LTV-sí-CAC (sí ibi kan lẹ́yìn àmì ìdá)?",
     "how": "LTV = owó oṣù × èrè àpapọ̀ × oṣù; ìpín = LTV ÷ CAC. Àwọn olùdókòwò fẹ́ràn láti rí 3× tàbí jù bẹ́ẹ̀ lọ."
    },
    "dilution": {
     "name": "Ìdínkù ìpín",
     "q": "O ní {{own}} nínú ilé-iṣẹ́ rẹ. Olùdókòwò kan fi {{invest}} sí i ní ìdíyelé ṣáájú owó tí ó jẹ́ {{pre}}. Kí ni o ní lẹ́yìn ìyípo náà (sí ibi kan lẹ́yìn àmì ìdá)?",
     "how": "Ìpín tuntun = ìpín àtijọ́ × ṣáájú owó ÷ lẹ́yìn owó, níbi tí lẹ́yìn owó = ṣáájú owó + ìdókòwò."
    },
    "evMultiple": {
     "name": "Ìdíyelé nípasẹ̀ ìlọ́po",
     "q": "Ilé-iṣẹ́ kan ń ṣe EBITDA tí ó jẹ́ {{ebitda}}. Àwọn ilé-iṣẹ́ tí ó jọra ń ta ní {{multiple}}× EBITDA. Ó ní {{debt}} gbèsè àti {{cash}} owó. Kí ni iye ìpín rẹ̀?",
     "how": "Iye ilé-iṣẹ́ = EBITDA × ìlọ́po. Iye ìpín = iye ilé-iṣẹ́ − gbèsè + owó."
    },
    "dcfPerpetuity": {
     "name": "DCF pẹ̀lú ìdàgbàsókè",
     "q": "Ọdún tó ń bọ̀ ilé-iṣẹ́ kan yóò ṣe owó tí ó wà lọ́fẹ̀ẹ́ tí ó jẹ́ {{fcf}}, tí yóò máa dàgbà {{g}} lọ́dún láéláé. Iye owó rẹ̀ jẹ́ {{r}}. Kí ni iye ilé-iṣẹ́ rẹ̀?",
     "how": "Iye = owó tí ó wà lọ́fẹ̀ẹ́ ọdún tó ń bọ̀ ÷ (iye owó − ìdàgbàsókè)."
    },
    "convertible": {
     "name": "Ìwé gbèsè tí ó lè yípadà",
     "q": "Ìwé gbèsè tí ó lè yípadà {{note}} yóò yípadà ní ìdínkù {{discount}} sí iye ìyípo tó ń bọ̀ tí ó jẹ́ {{price}} fún ìpín kọ̀ọ̀kan. Ìpín mélòó ni olùdókòwò yóò gbà (sí ìpín tó súnmọ́ jùlọ)?",
     "how": "Iye ìyípadà = iye ìyípo × (1 − ìdínkù); ìpín = ìwé gbèsè ÷ iye ìyípadà."
    },
    "twoStageDcf": {
     "name": "DCF ìpele méjì",
     "q": "Owó tí ó wà lọ́fẹ̀ẹ́ jẹ́ {{fcf}} lọ́dún yìí. Yóò dàgbà {{g1}} lọ́dún fún ọdún mẹ́ta tó ń bọ̀, lẹ́yìn náà {{g2}} lọ́dún láéláé. Iye owó jẹ́ {{r}}. Kí ni iye ilé-iṣẹ́ lónìí (sí dọ́là tó súnmọ́ jùlọ)?",
     "how": "Dín owó ọdún 1–3 kù, lẹ́yìn náà fi iye ìparí ní ọdún 3 = FCF₃ × (1 + g₂) ÷ (r − g₂), tí a dín kù fún ọdún mẹ́ta."
    }
   }
  },
  "charts": {
   "cash": "Owó",
   "value": "Iye ilé-iṣẹ́",
   "goal": "Àfojúsùn",
   "month": "Oṣù {{n}}",
   "quarter": "Q{{n}}",
   "day": "Ọjọ́ {{n}}",
   "week": "Ọ̀sẹ̀ {{n}}",
   "portfolio": "Àkójọpọ̀ rẹ",
   "index": "Owó ìdókòwò àtọ́ka",
   "revenue": "Owó tí ó ń wọlé",
   "costs": "Àpapọ̀ owó tí ó ń jáde",
   "profit": "Èrè",
   "customers": "Àwọn olùbàárà",
   "price": "Iye",
   "units": "Àwọn ẹ̀yà",
   "breakEven": "Ààlà ìdọ́gba",
   "demand": "Ìbéèrè",
   "yourPrice": "Iye rẹ",
   "allocation": "Ìpínpín",
   "needs": "Àwọn ohun tí ó pọn dandan",
   "wants": "Àwọn ohun tí ó fẹ́",
   "savings": "Ìṣẹ́mọ́ owó",
   "chartA11y": "{{title}}: {{summary}}"
  }
 },
 "ig": {
  "games": {
   "startup-tycoon": {
    "tagline": "Na-agba ụlọ ọrụ kwa ọnwa, wee tụọ uru ya dịka onye nyocha.",
    "rules": {
     "r1": "Kwa ọnwa, họrọ otu gị, mgbasa ozi gị na azịza maka nsogbu njikwa. Sava na-agba ọnwa ahụ ma na-ezitere gị uru na mfu.",
     "r2": "Mee ka uru ụlọ ọrụ too ruo ebumnuche na-enweghị ego gwụ. Mkpebi ọjọọ ma ọ bụ ịda ogbenye na-efu otu obi.",
     "r3": "Site na Mbido, tebụl onye nyocha na njedebe na-ajụ maka ọnụọgụ gị: oke uru, oge ego ga-ewe, na n'elu mbelata na ntule DCF.",
     "example": "Ego batara $9,000 − ọnụ ahịa ire $3,000 = uru zuru oke $6,000; mgbe $5,200 nke ụgwọ ọrụ na ụlọ gasịrị, ọnwa ahụ nwetara $800."
    }
   },
   "budget-master": {
    "tagline": "Hazie dollar ọ bụla, site na ego nta ruo ịkwụ ụgwọ.",
    "rules": {
     "r1": "Kwa ọnwa, kwụọ ụgwọ ndị ahụ, wee kesaa ndị fọdụrụ: nri, egwuregwu, uwe, ego mberede, ebumnuche nchekwa na ụgwọ mgbakwunye. Dollar ọ bụla ga-enwerịrị ọrụ.",
     "r2": "Mgbe ahụ ihe na-eme: họrọ otu ị ga-esi mee ya. Ịhapụ nri ma ọ bụ mkpebi ọjọọ na-efu otu obi.",
     "r3": "N'ọkwa ndị dị elu, ụgwọ ụlọ, ụgwọ kaadị nwere ọmụrụ na ụgwọ ọrụ na-adịghị agbanwe agbanwe na-abata; tebụl onye nyocha na-ajụ maka ọmụrụ, mgbazinye ego, ụtụ na ichekwa maka ezumike nka.",
     "example": "$400 ego nta: $60 ụgwọ, $80 nri, $40 egwuregwu, $220 echekwara (55%)."
    }
   },
   "market-master": {
    "tagline": "Tụọ ọnụ ahịa ụlọ ahịa, wee gụọ ahịa dịka onye akụ na ụba.",
    "rules": {
     "r1": "Kwa ụbọchị, debe ọnụ ahịa gị na ole ị ga-azụ. Ihu igwe, ìgwè mmadụ na onye asọmpi na-agbanwe ole ndị ahịa na-abịa.",
     "r2": "Ngwaahịa a na-ereghị na-efu, mfu na-efu otu obi. Ka ị na-abịaru uru kacha mma nso, ka ị na-enweta akara karịa.",
     "r3": "Nnyocha ahịa na-apụ na Upper-intermediate; tebụl onye nyocha na-aga site na ego ha nwetara gaa na elasticity, monopoly, concentration na asọmpi Cournot.",
     "example": "Iko 60 rere na $1.50 bụ $90 ego batara; na iko 70 azụrụ na $0.50 na ụgwọ $10, uru bụ $45."
    }
   },
   "profit-quest": {
    "tagline": "Nwee mma na mgbakọ uru, wee gbaa ụlọ ọrụ kwa izu.",
    "rules": {
     "r1": "Mgbakọ azụmahịa na izu ụlọ ọrụ na-agbanwe. Gbakọọ nchikota ọ bụla, wee họrọ azịza.",
     "r2": "N'izu ụlọ ọrụ, debe ọnụ ahịa na ole ị ga-emepụta; ihe fọdụrụ na-efu nchekwa. Mfu na-efu otu obi.",
     "r3": "Mgbakọ na-arịgo site na contribution na break-even gaa na operating leverage, NPV na ọnụ ahịa isi ego, na oge dị mkpụmkpụ.",
     "example": "Ọnụ ahịa $40, ọnụ ahịa imepụta $25: ire ọ bụla na-enye $15. Ọnụ ahịa a kapịrị ọnụ nke $1,500 chọrọ ire 100 iji ruo break-even."
    }
   },
   "market-simulator": {
    "tagline": "Tinye ego omume ma mụta ihe egwu, nlọghachi na ntule.",
    "rules": {
     "r1": "N'ime nkeji ọ bụla, gụọ akụkọ ma kewaa ego gị n'etiti ego nkịtị, bonds, index fund na ụlọ ọrụ e chepụtara (ọ ga-agbakọta 100%).",
     "r2": "Zaa ajụjụ itinye ego nke nkeji ahụ. Ịmeri index na ịgbasa ihe egwu na-enye akara; azịza na-ezighị ezi na-efu otu obi.",
     "r3": "Ụgwọ na oke na otu ụlọ ọrụ na-abịa na Upper-intermediate; tebụl onye nyocha na-arịgo ruo CAPM, ọnụ ahịa bond na ihe egwu portfolio.",
     "example": "60% na index fund nke rịgoro 5% na 40% na bonds nke rịgoro 1%: portfolio rịgoro 3.4%."
    }
   }
  },
  "analyst": {
   "eyebrow": "TEBỤL ONYE NYOCHA",
   "step": "Ajụjụ {{n}} nke {{total}}",
   "intro": "Gbakọọ ya na akwụkwọ ma ọ bụ na calculator, wee họrọ.",
   "check": "Lelee azịza",
   "right": "Ọ ziri ezi",
   "wrong": "Ọ bụghị kpọmkwem",
   "answerWas": "Azịza bụ {{answer}}.",
   "timeUp": "Oge agwụla",
   "method": "USORO",
   "next": "Osote",
   "review": "Tebụl onye nyocha",
   "kinds": {
    "saveWeeks": {
     "name": "Nchekwa ego",
     "q": "Ị na-echekwa {{weekly}} kwa izu maka ekweisi ntị nke ọnụ ahịa ya bụ {{target}}. Izu ole ruo mgbe ị ga-azụta ya?",
     "how": "Izu = ọnụ ahịa ÷ nchekwa kwa izu, gbakọtara elu: akụkụ izu ka pụtara ichere izu ọzọ."
    },
    "shareOf": {
     "name": "Oke ụgwọ ọrụ",
     "q": "Ego ị na-eweta n'ụlọ bụ {{income}} kwa ọnwa. Ego ole bụ {{share}} ya?",
     "how": "Ego = ụgwọ ọrụ × pasent ÷ 100. Iwu 50/30/20: 50% mkpa, 30% ọchịchọ, 20% nchekwa."
    },
    "simpleInterest": {
     "name": "Ọmụrụ dị mfe",
     "q": "Ị gbaziri {{principal}} na ọmụrụ dị mfe {{rate}} kwa afọ ruo {{years}} afọ. Ego ole ọmụrụ ị na-akwụ na mkpokọta?",
     "how": "Simple interest = principal × rate × years. A na-ana ọmụrụ naanị na ego e bu ụzọ gbaziri."
    },
    "cardInterest": {
     "name": "Ọmụrụ kaadị",
     "q": "Ego fọdụrụ na kaadị kredit gị bụ {{balance}} ma kaadị na-ana {{rate}} ọmụrụ kwa ọnwa. Ọ bụrụ na ị kwụghị ihe ọ bụla, olee ọmụrụ a na-agbakwunye n'ọnwa a?",
     "how": "Ọmụrụ kwa ọnwa = ego fọdụrụ × ọnụego kwa ọnwa. Ọ bụrụ na akwụghị ya, a na-agbakwunye ya na ego fọdụrụ ma ọ na-anatakwa ọmụrụ."
    },
    "compound": {
     "name": "Uto nchikọta",
     "q": "Ị tinyere {{principal}} na {{rate}} kwa afọ, nchikọta otu ugboro kwa afọ, ruo {{years}} afọ. Gịnị ka ọ ga-abụ na njedebe (ruo dollar kacha nso)?",
     "how": "Uru = ego mbụ × (1 + ọnụego)^afọ. Ọmụrụ nke afọ ọ bụla na-enweta ọmụrụ n'afọ ndị na-esote."
    },
    "realRate": {
     "name": "Nloghachi n'ezie",
     "q": "Ego nchekwa gị na-enweta {{nominal}} kwa afọ ebe ọnụ ahịa na-arị elu {{inflation}} kwa afọ. Gịnị bụ nloghachi gị n'ezie (ruo otu ebe ntụpọ)?",
     "how": "Nloghachi n'ezie = (1 + ọnụego nominal) ÷ (1 + ọnụego ọnụ ahịa) − 1. Ịwepụ ọnụ ahịa na nominal bụ naanị atụmatụ."
    },
    "ear": {
     "name": "Ọnụego afọ dị irè",
     "q": "Kaadị na-ana {{monthly}} ọmụrụ kwa ọnwa, nchikọta kwa ọnwa. Gịnị bụ ọnụego afọ dị irè (ruo otu ebe ntụpọ)?",
     "how": "Ọnụego afọ dị irè = (1 + ọnụego kwa ọnwa)^12 − 1. Ọ dị elu karịa 12 × ọnụego kwa ọnwa n'ihi na ọmụrụ na-achikọta."
    },
    "loanPayment": {
     "name": "Ịkwụghachi mgbazinye ego",
     "q": "Ị gbaziri {{principal}} na {{rate}} kwa afọ, a na-akwụ ya n'ụgwọ kwa ọnwa hà nhata ruo {{years}} afọ (a na-ana ọmụrụ kwa ọnwa). Gịnị bụ ụgwọ kwa ọnwa?",
     "how": "Ụgwọ = P × i ÷ (1 − (1 + i)^−n), ebe i = ọnụego afọ ÷ 12 na n = ọnụ ọgụgụ ọnwa."
    },
    "taxBands": {
     "name": "Ogo ụtụ isi",
     "q": "Ego na-abata: {{income}}. Ụtụ isi bụ 0% na {{band1}} mbụ, {{rate2}} na ego site na {{band1}} ruo {{band2}}, na {{rate3}} na ihe ọ bụla karịrị {{band2}}. Ego ole ka ụtụ isi zuru ezu?",
     "how": "Tụọ ụtụ isi n'ibe ego ọ bụla na ọnụego ya ma gbakọọ ibe ndị ahụ. Ogo dị elu anaghị atụ ụtụ isi na ego dị n'okpuru ya."
    },
    "retirement": {
     "name": "Nchekwa maka ezumike nká",
     "q": "Ị na-echekwa {{payment}} na njedebe afọ ọ bụla ruo {{years}} afọ na {{rate}} kwa afọ. Gịnị ka ite ego ga-abụ mgbe ụgwọ ikpeazụ gasịrị (ruo dollar kacha nso)?",
     "how": "Future value nke annuity = payment × ((1 + rate)^years − 1) ÷ rate."
    },
    "revenue": {
     "name": "Ego enwetara",
     "q": "Ị na-ere iko {{qty}} na {{price}} nke ọ bụla. Iko ọ bụla na-efu gị {{cost}} imepụta. Gịnị bụ ego ị nwetara?",
     "how": "Ego enwetara = ọnụ ọgụgụ erere × ọnụ ahịa. Ego enwetara bụ tupu ụgwọ ọ bụla; uru bụ ihe fọdụrụ mgbe e wepụsịrị ha."
    },
    "profitDay": {
     "name": "Uru otu ụbọchị",
     "q": "Ị zụtara ihe {{bought}} na {{cost}} nke ọ bụla ma kwụọ ụgwọ ebe {{fee}}. Ị na-ere {{qty}} n'ime ha na {{price}} nke ọ bụla, ndị fọdụrụ na-emebi. Gịnị bụ uru gị?",
     "how": "Uru = ire × ọnụ ahịa − ihe niile ị zụtara × ọnụ ahịa ya − ụgwọ a kapịrị ọnụ. Ngwaahịa a na-ereghị ka bụ ụgwọ."
    },
    "demandAt": {
     "name": "Ịgụ ọchịchọ",
     "q": "Na {{p1}} ị na-enweta ndị ahịa {{q1}}; na {{p2}} ị na-enweta {{q2}}. Ọchịchọ na-ada n'ahịrị kwụ ọtọ. Ndị ahịa ole ka ị ga-enweta na {{p3}}?",
     "how": "Ahịrị kwụ ọtọ na-efunahụ otu ọnụ ọgụgụ ndị ahịa maka dollar ọ bụla ọzọ: chọta mkpọda ahụ, wee gaa n'ihu."
    },
    "elasticity": {
     "name": "Elasticity ọnụ ahịa",
     "q": "Mgbe ọnụ ahịa rịrị elu site na {{p1}} ruo {{p2}}, ire adaala site na {{q1}} ruo {{q2}}. N'iji usoro etiti, gịnị bụ elasticity ọnụ ahịa nke ọchịchọ (dị ka ọnụ ọgụgụ dị mma, ruo abụọ ebe ntụpọ)?",
     "how": "Elasticity = (mgbanwe na Q ÷ nkezi Q) ÷ (mgbanwe na P ÷ nkezi P). Karịa 1 bụ elastic; n'okpuru 1 bụ inelastic."
    },
    "bestPrice": {
     "name": "Ọnụ ahịa kacha mma",
     "q": "Ndị ahịa kwa ụbọchị = {{a}} − {{b}} × ọnụ ahịa, na ihe ọ bụla na-efu gị {{cost}}. Olee ọnụ ahịa na-enye uru kacha?",
     "how": "Site na straight-line demand, ọnụ ahịa na-ebuli uru kachasị bụ ọkara n'etiti ọnụ ahịa na ọnụ ahịa onye na-enweghị onye na-azụ: (a ÷ b + cost) ÷ 2."
    },
    "monopolyQ": {
     "name": "Mmepụta monopoly",
     "q": "Monopoly na-eche usoro ọchịchọ P = {{A}} − {{B}}Q ma nwee ụgwọ njedebe na-adịgide adịgide nke {{mc}}. Olee ọnụ ọgụgụ na-enye uru ya kacha (ruo otu ebe ntụpọ)?",
     "how": "Tọọ ego na-abata njedebe hà ụgwọ njedebe: MR = A − 2BQ, ya mere Q = (A − MC) ÷ 2B."
    },
    "hhi": {
     "name": "Mkpokọta ahịa",
     "q": "Ụlọ ọrụ {{firms}} n'otu ahịa nwere oke {{shares}}. Gịnị bụ Herfindahl–Hirschman Index (HHI)?",
     "how": "HHI = nchikota nke square nke oke ahịa ụlọ ọrụ ọ bụla (na %). Karịa 2,500 ka a na-ewerekarị dị ka highly concentrated."
    },
    "cournot": {
     "name": "Duopoly (Cournot)",
     "q": "Ụlọ ọrụ abụọ yiri onwe ha na-asọ mpi n'ọnụ ọgụgụ. Ọchịchọ ahịa bụ P = {{A}} − {{B}}(q₁ + q₂) ma nke ọ bụla nwere ụgwọ njedebe na-adịgide adịgide nke {{mc}}. Na nguzozi Cournot, olee ihe ụlọ ọrụ ọ bụla na-emepụta (ruo otu ebe ntụpọ)?",
     "how": "Nzaghachi kacha mma nke ụlọ ọrụ ọ bụla bụ q = (A − MC − Bq_ibé) ÷ 2B; na ụlọ ọrụ yiri onwe ha, q = (A − MC) ÷ 3B."
    },
    "deadweight": {
     "name": "Mfu nke ibu arọ",
     "q": "Monopoly na-eche P = {{A}} − {{B}}Q na constant marginal cost nke {{mc}}. Tụnyere perfect competition, gịnị bụ deadweight loss (ruo dollar kacha nso)?",
     "how": "Monopoly na-eme Q = (A − MC) ÷ 2B, ọkara nke asọmpi Q = (A − MC) ÷ B. Triangle furu efu bụ (A − MC)² ÷ 8B."
    },
    "operatingLeverage": {
     "name": "Leverage arụ ọrụ",
     "q": "Ị na-ere {{units}} unit na {{price}}; nke ọ bụla na-efu {{unit}} imepụta, na ọnụ ahịa a kapịrị ọnụ bụ {{fixed}}. Gịnị bụ degree of operating leverage (ruo ọnụọgụ abụọ)?",
     "how": "DOL = mkpokọta onyinye ÷ uru arụ ọrụ. DOL nke 3 pụtara mgbanwe 1% na ahịa na-eme ka uru gbanwee ihe dịka 3%."
    },
    "npv": {
     "name": "Net present value",
     "q": "Otu igwe na-eri {{cost}} taa ma na-eweta {{cash}} na njedebe afọ ọ bụla ruo {{years}} afọ. Na ọnụego mbelata {{rate}}, gịnị bụ NPV ya (ruo dollar kacha nso)?",
     "how": "NPV = cash × (1 − (1 + r)^−years) ÷ r − cost. Tinye ego mgbe NPV dị mma."
    },
    "wacc": {
     "name": "Ọnụ ahịa isi ego",
     "q": "Ụlọ ọrụ nwere {{equity}} nke equity na-efu {{re}} na {{debt}} nke debt na-efu {{rd}} tupu ụtụ. Ụtụ bụ {{tax}}. Gịnị bụ WACC ya (ruo ọnụọgụ abụọ)?",
     "how": "WACC = E ÷ V × cost of equity + D ÷ V × cost of debt × (1 − tax), ebe V = E + D. A na-ewepụ ụtụ na ọmụrụ."
    },
    "projectNpv": {
     "name": "Nyocha ọrụ",
     "q": "Ụlọ ọrụ nwere {{equity}} nke equity (cost {{re}}) na {{debt}} nke debt (cost {{rd}} tupu ụtụ, ụtụ {{tax}}) na-atụle project na-efu {{cost}} nke na-eweghachi {{cash}} na njedebe afọ ọ bụla ruo {{years}} afọ. Discounted na WACC ụlọ ọrụ, gịnị bụ NPV project (ruo dollar kacha nso)?",
     "how": "Nke mbụ WACC = E ÷ V × re + D ÷ V × rd × (1 − tax); mgbe ahụ NPV = cash × (1 − (1 + WACC)^−years) ÷ WACC − cost."
    },
    "dividendYield": {
     "name": "Mkpụrụ dividend",
     "q": "Otu share na-efu {{price}} ma na-akwụ dividend nke {{dividend}} kwa afọ. Gịnị bụ dividend yield ya (ruo otu ọnụọgụ)?",
     "how": "Mkpụrụ dividend = dividend kwa afọ ÷ ọnụ ahịa òkè × 100."
    },
    "portfolioReturn": {
     "name": "Nloghachi pọtụfoliyo",
     "q": "Ị na-ejide {{w1}} nke ego gị na fund nke nloghachi ya bụ {{r1}} na {{w2}} na nke nloghachi ya bụ {{r2}}. Gịnị ka pọtụfoliyo gị dum nloghachi?",
     "how": "Nloghachi pọtụfoliyo = ibu nke ihe ọ bụla ejidere × nloghachi ya, gbakọtara ọnụ."
    },
    "peValue": {
     "name": "Ọnụ ahịa site na P/E",
     "q": "Otu ụlọ ọrụ na-enweta {{eps}} kwa òkè. Ụlọ ọrụ ndị yiri ya na-ere na ọnụego price/earnings nke {{pe}}. Gịnị ọnụ ahịa òkè nke ahụ na-atụ aro?",
     "how": "Ọnụ ahịa = earnings kwa òkè × ọnụego P/E."
    },
    "capm": {
     "name": "CAPM",
     "q": "Risk-free rate bụ {{rf}}, a na-atụ anya ka ahịa weghachi {{rm}}, na share nwere beta nke {{beta}}. Site na CAPM, gịnị return ka ndị investors kwesịrị ịtụ anya (ruo otu ọnụọgụ)?",
     "how": "Nloghachi a tụrụ anya = ọnụego enweghị ihe ize ndụ + beta × (nloghachi ahịa − ọnụego enweghị ihe ize ndụ)."
    },
    "sharpe": {
     "name": "Ọnụego Sharpe",
     "q": "Otu fund weghachiri {{rp}} na standard deviation nke {{sd}}; risk-free rate bụ {{rf}}. Gịnị bụ Sharpe ratio ya (ruo ọnụọgụ abụọ)?",
     "how": "Ọnụego Sharpe = (nloghachi − ọnụego enweghị ihe ize ndụ) ÷ standard deviation: nloghachi mgbakwunye a na-enweta maka otu unit ihe ize ndụ."
    },
    "gordon": {
     "name": "Dividend discount model",
     "q": "Otu share ka kwụrụ dividend nke {{d0}}. Dividend na-eto {{g}} kwa afọ ruo mgbe ebighị ebi na ndị investors chọrọ {{r}}. Gịnị bụ uru share (Gordon growth model)?",
     "how": "Uru = dividend afọ na-esote ÷ (nloghachi achọrọ − uto) = D₀ × (1 + g) ÷ (r − g)."
    },
    "bondPrice": {
     "name": "Ọnụ ahịa bond",
     "q": "Bond nwere face value {{face}} na-akwụ coupon {{coupon}} otu ugboro kwa afọ ma na-eto na {{years}} afọ. Ọ bụrụ na market yield bụ {{y}}, gịnị bụ ọnụ ahịa ya?",
     "how": "Price = coupons discounted dị ka annuity + face value ÷ (1 + yield)^years. Ọnụ ahịa na-ada mgbe yield na-arịgo."
    },
    "twoAssetSd": {
     "name": "Ihe ize ndụ pọtụfoliyo",
     "q": "Ị tinyere {{w1}} na asset A (standard deviation {{s1}}) na {{w2}} na asset B (standard deviation {{s2}}). Correlation ha bụ {{rho}}. Gịnị bụ standard deviation portfolio (ruo otu ọnụọgụ)?",
     "how": "σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). N'okpuru correlation nke 1, ịgwakọta assets na-ebelata ihe egwu: diversification."
    },
    "grossMargin": {
     "name": "Mkpụrụ oke",
     "q": "Ị na-ere ngwaahịa na {{price}}. Ọ na-efu {{unit}} imepụta na ibuga. Gịnị bụ gross margin gị (ruo otu ọnụọgụ)?",
     "how": "Mkpụrụ oke = (ọnụ ahịa − ọnụ ahịa ire) ÷ ọnụ ahịa × 100."
    },
    "runway": {
     "name": "Runway",
     "q": "Otu startup nwere {{cash}} n'ụlọ akụ. Ọ na-eweta {{revenue}} kwa ọnwa ma na-emefu {{costs}} kwa ọnwa. Ruo ọnwa ole zuru ezu ka ọ nwere ike ịga n'ihu?",
     "how": "Runway = cash ÷ monthly burn, ebe burn = costs − revenue. Gbadaa: akụkụ ọnwa ikpeazụ ekpuchighị."
    },
    "ltvCac": {
     "name": "LTV : CAC",
     "q": "Onye ahịa na-akwụ {{monthly}} kwa ọnwa na gross margin {{gm}} ma na-anọ {{months}} ọnwa na nkezi. Imeri onye ahịa ọ bụla na-efu {{cac}}. Gịnị bụ LTV-to-CAC ratio (ruo otu ọnụọgụ)?",
     "how": "LTV = ụgwọ ọnwa × oke uru × ọnwa; oke = LTV ÷ CAC. Ndị na-etinye ego na-amasị ịhụ 3× ma ọ bụ karịa."
    },
    "dilution": {
     "name": "Mbelata oke",
     "q": "Ị nwere {{own}} nke startup gị. Onye investor tinyere {{invest}} na pre-money valuation nke {{pre}}. Gịnị ka ị nwere mgbe round gasịrị (ruo otu ọnụọgụ)?",
     "how": "New stake = old stake × pre-money ÷ post-money, ebe post-money = pre-money + investment."
    },
    "evMultiple": {
     "name": "Valuation site na multiple",
     "q": "Ụlọ ọrụ na-enweta EBITDA nke {{ebitda}}. Ụlọ ọrụ yiri ya na-ere na {{multiple}}× EBITDA. O nwere {{debt}} nke debt na {{cash}} nke cash. Gịnị bụ uru equity ya?",
     "how": "Enterprise value = EBITDA × multiple. Equity value = enterprise value − debt + cash."
    },
    "dcfPerpetuity": {
     "name": "DCF na uto",
     "q": "N'afọ ọzọ ụlọ ọrụ ga-emepụta free cash flow nke {{fcf}}, na-eto {{g}} kwa afọ ruo mgbe ebighị ebi. Cost of capital ya bụ {{r}}. Gịnị bụ enterprise value ya?",
     "how": "Value = free cash flow nke afọ ọzọ ÷ (cost of capital − growth)."
    },
    "convertible": {
     "name": "Akwụkwọ mgbanwe",
     "q": "Convertible note nke {{note}} na-agbanwe na discount {{discount}} na ọnụ ahịa round ọzọ nke {{price}} kwa share. Ego ole ka investor na-enweta (ruo share kacha nso)?",
     "how": "Conversion price = round price × (1 − discount); shares = note ÷ conversion price."
    },
    "twoStageDcf": {
     "name": "DCF nke ngalaba abụọ",
     "q": "Free cash flow bụ {{fcf}} n'afọ a. Ọ ga-eto {{g1}} kwa afọ ruo afọ atọ na-esote, mgbe ahụ {{g2}} kwa afọ ruo mgbe ebighị ebi. Cost of capital bụ {{r}}. Gịnị bụ enterprise value taa (ruo dollar kacha nso)?",
     "how": "Discount cash flows nke afọ 1–3, mgbe ahụ gbakwunye terminal value na afọ 3 = FCF₃ × (1 + g₂) ÷ (r − g₂), discounted afọ atọ."
    }
   }
  },
  "charts": {
   "cash": "Ego",
   "value": "Uru ụlọ ọrụ",
   "goal": "Ebumnuche",
   "month": "Ọnwa {{n}}",
   "quarter": "Q{{n}}",
   "day": "Ụbọchị {{n}}",
   "week": "Izu {{n}}",
   "portfolio": "Portfolio gị",
   "index": "Index fund",
   "revenue": "Ego nbata",
   "costs": "Mkpokọta ụgwọ",
   "profit": "Uru",
   "customers": "Ndị ahịa",
   "price": "Ọnụ ahịa",
   "units": "Nkeji",
   "breakEven": "Break-even",
   "demand": "Achọrọ",
   "yourPrice": "Ọnụ ahịa gị",
   "allocation": "Nkesa",
   "needs": "Mkpa",
   "wants": "Ọchịchọ",
   "savings": "Nchekwa",
   "chartA11y": "{{title}}: {{summary}}"
  }
 },
 "ha": {
  "games": {
   "startup-tycoon": {
    "tagline": "Sarrafa kamfani wata-wata, sannan ka kimanta shi kamar manazarcin kuɗi.",
    "rules": {
     "r1": "Kowace wata, zaɓi ƙungiyarka, tallanka da amsar wata matsala ta gudanarwa. Sabar tana gudanar da watan kuma tana aiko maka riba da asara.",
     "r2": "Ƙara darajar kamfanin zuwa manufa ba tare da kuɗinka ya ƙare ba. Zabi mara kyau ko fatara yana cinye zuciya ɗaya.",
     "r3": "Daga Mai Farawa, teburin mai nazari a ƙarshe yana tambaya game da lambobinka: ribar kuɗi, tsawon lokacin da kuɗi zai wuce, kuma a saman dilution da ƙimar DCF.",
     "example": "Kuɗin shiga $9,000 − kuɗin sayarwa $3,000 = ribar gabaɗaya $6,000; bayan $5,200 na albashi da haya, watan ya samu $800."
    }
   },
   "budget-master": {
    "tagline": "Tsara kowace dala, daga kuɗin aljihu zuwa biyan bashi.",
    "rules": {
     "r1": "Kowace wata, biya kuɗin da ake buƙata, sannan raba sauran: abinci, nishaɗi, tufafi, asusun gaggawa, manufar ajiya da ƙarin biyan bashi. Kowace dala dole ta sami aiki.",
     "r2": "Sannan wani abu ya faru: zaɓi yadda za ka magance shi. Tsallake abinci ko zabi mara kyau yana cinye zuciya ɗaya.",
     "r3": "Matakai mafi girma suna kawo haya, bashin kati da riba da albashi marar daidaito; teburin manazarcin yana tambaya game da riba, lamuni, haraji da ajiyar kuɗin ritaya.",
     "example": "$400 na kuɗin aljihu: $60 na kuɗin da ake buƙata, $80 na abinci, $40 na nishaɗi, $220 da aka ajiye (55%)."
    }
   },
   "market-master": {
    "tagline": "Sanya farashin rumfar kasuwa, sannan ka karanta kasuwanni kamar masanin tattalin arziki.",
    "rules": {
     "r1": " Kowace rana, sanya farashinka da adadin kayan da za ka saya. Yanayi, taron mutane da abokin hamayya suna canza yawan abokan ciniki.",
     "r2": "Kayan da ba a sayar da su suna ɓata kuma asara tana cinye zuciya ɗaya. Yadda ka fi kusanci da mafi kyawun riba, haka ka fi samun maki.",
     "r3": "Binciken kasuwa yana raguwa daga Matsakaici na Sama; teburin mai nazari yana tafiya daga kuɗin shiga zuwa elasticity, monopoly, concentration da gasar Cournot.",
     "example": "Kofuna 60 da aka sayar a $1.50 sune $90 na kuɗin shiga; da kofuna 70 da aka saya a $0.50 da kuɗin $10, riba ita ce $45."
    }
   },
   "profit-quest": {
    "tagline": "Ƙware lissafin riba, sannan ka sarrafa masana'anta mako-mako.",
    "rules": {
     "r1": "Lissafin kasuwanci da makonnin masana'anta suna juyawa. Yi lissafin kowace jimla, sannan zaɓi amsa.",
     "r2": "A makon masana'anta, sanya farashi da adadin da za a yi; ragowar suna cin kuɗin ajiya. Asara tana cinye zuciya ɗaya.",
     "r3": "Lissafin yana hawa daga gudummuwa da daidaiton kuɗi zuwa ƙarfin aiki, NPV da kuɗin jari, tare da gajeren lokaci.",
     "example": "Farashi $40, kuɗin yin $25: kowace sayarwa tana ba da gudummuwa $15. Kuɗin tsayayye na $1,500 na buƙatar sayarwa 100 don daidaitawa."
    }
   },
   "market-simulator": {
    "tagline": "Saka kuɗin horo ka koyi haɗari, riba da kimantawa.",
    "rules": {
     "r1": "Kowane kwata, karanta labarai ka raba kuɗinka tsakanin kuɗi, bonds, asusun index da kamfanoni na ƙirƙira (dole ya haura zuwa 100%).",
     "r2": "Amsa tambayar saka jari ta kwatar. Cin nasara akan index da yada haɗari suna samun maki; amsa mara kyau tana cinye zuciya ɗaya.",
     "r3": "Kuɗaɗe da iyaka kan kamfani ɗaya suna zuwa a Matsakaici na Sama; teburin mai nazari yana zuwa har zuwa CAPM, farashin bond da haɗarin portfolio.",
     "example": "60% a asusun index da ya tashi 5% da 40% a bonds da suka tashi 1%: portfolio ya tashi 3.4%."
    }
   }
  },
  "analyst": {
   "eyebrow": "TEBURIN MANAZARCI",
   "step": "Tambaya {{n}} cikin {{total}}",
   "intro": "Yi lissafi a takarda ko da kalkuleta, sannan zaɓi.",
   "check": "Duba amsa",
   "right": "Daidai",
   "wrong": "Ba daidai ba",
   "answerWas": "Amsar ita ce {{answer}}.",
   "timeUp": "Lokaci ya ƙare",
   "method": "HANYA",
   "next": "Na gaba",
   "review": "Teburin manazarcin",
   "kinds": {
    "saveWeeks": {
     "name": "Ajiyar kuɗi",
     "q": "Kana ajiye {{weekly}} a mako don belun kunne da farashinsa {{target}}. Makonni nawa kafin ka iya saya?",
     "how": "Makonni = farashi ÷ ajiyar mako, a tattake sama: rabin mako yana nufin jira wani mako."
    },
    "shareOf": {
     "name": "Kason albashi",
     "q": "Albashinka da ka karɓa shine {{income}} a wata. Nawa ne {{share}} daga ciki?",
     "how": "Adadi = albashi × kashi ÷ 100. Dokar 50/30/20: 50% buƙatu, 30% sha'awa, 20% ajiya."
    },
    "simpleInterest": {
     "name": "Riba mai sauƙi",
     "q": "Ka karɓi {{principal}} a riba mai sauƙi {{rate}} a shekara tsawon shekaru {{years}}. Nawa ribar da za ka biya gabaɗaya?",
     "how": "Riba mai sauƙi = principal × rate × shekaru. Riba ana cajin ta ne kawai akan adadin da aka fara karɓa."
    },
    "cardInterest": {
     "name": "Ribar kati",
     "q": "Bashin katinka {{balance}} ne kuma katin yana karɓar riba {{rate}} a wata. Idan ba ka biya komai ba, nawa ne ribar da za a ƙara a wannan watan?",
     "how": "Ribar wata = bashin × ƙimar wata. Idan ba a biya ba, ana ƙara ta a bashin kuma tana samun riba ita ma."
    },
    "compound": {
     "name": "Girman haɗaɗɗiya",
     "q": "Ka saka {{principal}} a {{rate}} a shekara, ana haɗawa sau ɗaya a shekara, na tsawon shekaru {{years}}. Nawa ne zai kai a ƙarshe (zuwa dala mafi kusa)?",
     "how": "Ƙima = babban kuɗi × (1 + ƙima)^shekaru. Riba ta kowace shekara tana samun riba a shekaru masu zuwa."
    },
    "realRate": {
     "name": "Ribar gaske",
     "q": "Ajiyarka tana samun {{nominal}} a shekara yayin da farashi ke ƙaruwa {{inflation}} a shekara. Menene ribarka ta gaske (zuwa lamba ɗaya bayan aya)?",
     "how": "Ribar gaske = (1 + ƙimar suna) ÷ (1 + hauhawar farashi) − 1. Ƙimar suna a rage hauhawar farashi kimanin ne kawai."
    },
    "ear": {
     "name": "Ƙimar shekara mai tasiri",
     "q": "Kati yana karɓar riba {{monthly}} a wata, ana haɗawa kowane wata. Menene ƙimar shekara mai tasiri (zuwa lamba ɗaya bayan aya)?",
     "how": "Ƙimar shekara mai tasiri = (1 + ƙimar wata)^12 − 1. Ta fi 12 × ƙimar wata saboda haɗawar riba."
    },
    "loanPayment": {
     "name": "Biyan bashi",
     "q": "Ka karɓi {{principal}} a {{rate}} a shekara, za a biya a daidaitattun kuɗin wata cikin shekaru {{years}} (ana karɓar riba kowane wata). Nawa ne kuɗin wata?",
     "how": "Biya = P × i ÷ (1 − (1 + i)^−n), inda i = ƙimar shekara ÷ 12 kuma n = adadin watanni."
    },
    "taxBands": {
     "name": "Matakan haraji",
     "q": "Kuɗin shiga: {{income}}. Haraji 0% ne a kan {{band1}} na farko, {{rate2}} a kan kuɗin shiga daga {{band1}} zuwa {{band2}}, kuma {{rate3}} a kan duk abin da ya wuce {{band2}}. Nawa ne jimillar harajin da ake bi?",
     "how": "Yi harajin kowane yanki na kuɗin shiga da ƙimarsa, sannan ka haɗa su. Matsayi mafi girma ba ya harajin kuɗin da ke ƙasa."
    },
    "retirement": {
     "name": "Ajiya don yin ritaya",
     "q": "Kana ajiye {{payment}} a ƙarshen kowace shekara na shekaru {{years}} a {{rate}} a shekara. Nawa ne ajiyar za ta kai bayan biyan ƙarshe (zuwa dala mafi kusa)?",
     "how": "Ƙimar gaba ta annuity = biya × ((1 + ƙima)^shekaru − 1) ÷ ƙima."
    },
    "revenue": {
     "name": "Kuɗin shiga",
     "q": "Kana sayar da kofuna {{qty}} a {{price}} kowace. Kowace kofa tana kashe ka {{cost}} don yin ta. Menene kuɗin shigarka?",
     "how": "Kuɗin shiga = adadin da aka sayar × farashi. Kuɗin shiga kafin kowane kashewa ne; riba ita ce abin da ya rage bayan kashewa."
    },
    "profitDay": {
     "name": "Ribar rana ɗaya",
     "q": "Ka sayi kaya {{bought}} a {{cost}} kowanne kuma ka biya kuɗin rumfa {{fee}}. Ka sayar da {{qty}} daga cikinsu a {{price}} kowanne, sauran kuma sun ɓata. Menene ribarka?",
     "how": "Riba = sayarwa × farashi − duk abin da ka saya × kuɗinsa − kuɗaɗen da ba a canza ba. Kayan da ba a sayar ba kashewa ne har yanzu."
    },
    "demandAt": {
     "name": "Karanta buƙata",
     "q": "A {{p1}} kana samun abokan ciniki {{q1}}; a {{p2}} kana samun {{q2}}. Buƙata tana faɗuwa a layi madaidaici. Abokan ciniki nawa za ka samu a {{p3}}?",
     "how": "Layi madaidaici yana rasa adadin abokan ciniki ɗaya ga kowace ƙarin dala: nemo wannan gangaren, sannan ka ci gaba da shi."
    },
    "elasticity": {
     "name": "Elasticity na farashi",
     "q": "Lokacin da farashi ya tashi daga {{p1}} zuwa {{p2}}, sayarwa ta faɗi daga {{q1}} zuwa {{q2}}. Da hanyar tsakiya, menene elasticity na buƙata ga farashi (a matsayin lamba tabbatacciya, zuwa lamba biyu bayan aya)?",
     "how": "Elasticity = (canjin Q ÷ matsakaicin Q) ÷ (canjin P ÷ matsakaicin P). Sama da 1 elastic ne; ƙasa da 1 ba elastic ba ne."
    },
    "bestPrice": {
     "name": "Mafi kyawun farashi",
     "q": "Abokan ciniki a rana = {{a}} − {{b}} × farashi, kuma kowane abu yana kashe ka {{cost}}. Wane farashi ne zai kawo riba mafi yawa?",
     "how": "Da buƙatu madaidaiciya, farashin da ke samar da riba mafi yawa yana tsakiyar tsakanin kuɗi da farashin da babu wanda zai saya: (a ÷ b + kuɗi) ÷ 2."
    },
    "monopolyQ": {
     "name": "Fitar da monopoly",
     "q": "Monopoly yana fuskantar lanƙwan buƙata P = {{A}} − {{B}}Q kuma yana da tsayayyen kuɗin gefe na {{mc}}. Wane adadi ne zai kawo riba mafi yawa (zuwa lamba ɗaya bayan aya)?",
     "how": "Sanya kuɗin shiga na gefe daidai da kuɗin gefe: MR = A − 2BQ, don haka Q = (A − MC) ÷ 2B."
    },
    "hhi": {
     "name": "Tattarawar kasuwa",
     "q": "Kamfanoni {{firms}} a kasuwa suna da kaso {{shares}}. Menene Herfindahl–Hirschman Index (HHI)?",
     "how": "HHI = jimillar duk kaso na kamfani da aka yi murabba'i (a %). Sama da 2,500 yawanci ana ɗaukarsa a matsayin tattarawa sosai."
    },
    "cournot": {
     "name": "Duopoly (Cournot)",
     "q": "Kamfanoni biyu iri ɗaya suna gasa a kan adadi. Buƙatar kasuwa ita ce P = {{A}} − {{B}}(q₁ + q₂) kuma kowanne yana da tsayayyen kuɗin gefe na {{mc}}. A daidaiton Cournot, nawa ne kowanne kamfani zai samar (zuwa lamba ɗaya bayan aya)?",
     "how": "Amsar mafi kyau ta kowanne kamfani ita ce q = (A − MC − Bq_other) ÷ 2B; da kamfanoni iri ɗaya, q = (A − MC) ÷ 3B."
    },
    "deadweight": {
     "name": "Asarar mara nauyi",
     "q": "Wani kamfani mai zaman kansa yana fuskantar P = {{A}} − {{B}}Q tare da tsadar gefe na dindindin na {{mc}}. Idan aka kwatanta da gasa cikakkiya, menene asarar mara nauyi (zuwa dala mafi kusa)?",
     "how": "Monopoly yana yin Q = (A − MC) ÷ 2B, rabin Q na gasa = (A − MC) ÷ B. Ƙasawar da aka rasa ita ce (A − MC)² ÷ 8B."
    },
    "operatingLeverage": {
     "name": "Ƙarfin aiki",
     "q": "Kana sayar da raka'a {{units}} a {{price}}; kowace tana kashe {{unit}} don yin ta, kuma kuɗin da ba ya canzawa {{fixed}}. Menene matakin ƙarfin aiki (zuwa wurare biyu na goma)?",
     "how": "DOL = jimillar gudumawa ÷ ribar aiki. DOL na 3 yana nufin canjin 1% a tallace-tallace yana motsa riba da kusan 3%."
    },
    "npv": {
     "name": "Ƙimar yanzu ta net",
     "q": "Wata na'ura tana kashe {{cost}} yau kuma tana kawo {{cash}} a ƙarshen kowace shekara har shekaru {{years}}. A ƙimar rangwame {{rate}}, menene NPV ɗinta (zuwa dala mafi kusa)?",
     "how": "NPV = cash × (1 − (1 + r)^−years) ÷ r − cost. Saka jari idan NPV ya kasance tabbatacce."
    },
    "wacc": {
     "name": "Tsadar jari",
     "q": "Wani kamfani yana da {{equity}} na ãdalci mai tsada {{re}} da {{debt}} na bashi mai tsada {{rd}} kafin haraji. Ƙimar haraji ita ce {{tax}}. Menene WACC ɗinsa (zuwa wurare biyu na goma)?",
     "how": "WACC = E ÷ V × tsadar ãdalci + D ÷ V × tsadar bashi × (1 − tax), inda V = E + D. Ana cire riba daga haraji."
    },
    "projectNpv": {
     "name": "Tantancewar aiki",
     "q": "Wani kamfani mai {{equity}} na ãdalci (tsada {{re}}) da {{debt}} na bashi (tsada {{rd}} kafin haraji, ƙimar haraji {{tax}}) yana tunanin aikin da zai kashe {{cost}} wanda zai dawo da {{cash}} a ƙarshen kowace shekara har shekaru {{years}}. Idan aka rangwame shi da WACC na kamfanin, menene NPV na aikin (zuwa dala mafi kusa)?",
     "how": "Da farko WACC = E ÷ V × re + D ÷ V × rd × (1 − tax); sannan NPV = cash × (1 − (1 + WACC)^−years) ÷ WACC − cost."
    },
    "dividendYield": {
     "name": "Amfanin rabo",
     "q": "Wani hannun jari yana kashe {{price}} kuma yana biyan rabo na {{dividend}} a shekara. Menene amfanin rabonsa (zuwa wuri ɗaya na goma)?",
     "how": "Amfanin rabo = rabon shekara ÷ farashin hannun jari × 100."
    },
    "portfolioReturn": {
     "name": "Komawar portfolio",
     "q": "Kana riƙe {{w1}} na kuɗinka a asusun da ya dawo da {{r1}} da {{w2}} a wani da ya dawo da {{r2}}. Menene amfanin dukan fayilinka?",
     "how": "Amfanin fayil = nauyin kowane riƙe × amfaninsa, a haɗa su."
    },
    "peValue": {
     "name": "Farashi daga P/E",
     "q": "Wani kamfani yana samun {{eps}} a kowace hannun jari. Kamfanoni makamantansu suna ciniki a rabon farashi/riba na {{pe}}. Wane farashin hannun jari hakan ke nuna?",
     "how": "Farashi = riba a kowace hannun jari × rabon P/E."
    },
    "capm": {
     "name": "CAPM",
     "q": "Ƙimar mara haɗari ita ce {{rf}}, ana sa ran kasuwa za ta dawo da {{rm}}, kuma wani hannun jari yana da beta na {{beta}}. Ta amfani da CAPM, wane amfani ya kamata masu saka jari su yi tsammani (zuwa wuri ɗaya na goma)?",
     "how": "Amfanin da ake tsammani = ƙimar mara haɗari + beta × (amfanin kasuwa − ƙimar mara haɗari)."
    },
    "sharpe": {
     "name": "Rabon Sharpe",
     "q": "Wani asusu ya dawo da {{rp}} tare da karkacewar ma'auni na {{sd}}; ƙimar mara haɗari ita ce {{rf}}. Menene rabon Sharpe ɗinsa (zuwa wurare biyu na goma)?",
     "how": "Rabon Sharpe = (amfani − ƙimar mara haɗari) ÷ karkacewar ma'auni: ƙarin amfanin da ake samu ga kowace raka'a ta haɗari."
    },
    "gordon": {
     "name": "Samfurin rangwamen rabo",
     "q": "Wani hannun jari ya biya rabo na {{d0}} kwanan nan. Raba yana girma {{g}} a shekara har abada kuma masu saka jari suna buƙatar {{r}}. Menene darajar hannun jarin (samfurin girma na Gordon)?",
     "how": "Daraja = rabon shekara mai zuwa ÷ (amfanin da ake buƙata − girma) = D₀ × (1 + g) ÷ (r − g)."
    },
    "bondPrice": {
     "name": "Farashin bond",
     "q": "Wani bond mai ƙimar fuska {{face}} yana biyan coupon na {{coupon}} sau ɗaya a shekara kuma yana ƙarewa cikin shekaru {{years}}. Idan amfanin kasuwa shine {{y}}, menene farashinsa?",
     "how": "Farashi = coupons da aka rangwame a matsayin annuity + ƙimar fuska ÷ (1 + yield)^years. Farashi yana faɗuwa idan amfani ya tashi."
    },
    "twoAssetSd": {
     "name": "Haɗarin portfolio",
     "q": "Ka saka {{w1}} a kadara A (standard deviation {{s1}}) da {{w2}} a kadara B (standard deviation {{s2}}). Haɗin su shine {{rho}}. Menene standard deviation na portfolio (zuwa lamba ɗaya bayan goma)?",
     "how": "σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). Ƙasa da haɗi na 1, haɗa kadara yana rage haɗari: rarrabawa."
    },
    "grossMargin": {
     "name": "Ribar gabaɗaya",
     "q": "Kana sayar da samfur a {{price}}. Yana kashe {{unit}} don yin shi da isar da shi. Menene ribar gabaɗayarka (zuwa wuri ɗaya na goma)?",
     "how": "Ribar gabaɗaya = (farashi − tsadar sayarwa) ÷ farashi × 100."
    },
    "runway": {
     "name": "Tsawon lokacin kuɗi",
     "q": "Wani sabon kamfani yana da {{cash}} a banki. Yana shigo da {{revenue}} a wata kuma yana kashe {{costs}} a wata. Har wata guda nawa zai iya ci gaba?",
     "how": "Runway = kuɗi ÷ ƙonawa kowace wata, inda ƙonawa = kuɗaɗe − kuɗin shiga. A zagaye ƙasa: ɓangaren watan ƙarshe ba a rufe shi."
    },
    "ltvCac": {
     "name": "LTV : CAC",
     "q": "Abokin ciniki yana biya {{monthly}} a wata a {{gm}} gross margin kuma yana zama watanni {{months}} a matsakaici. Samun kowane abokin ciniki yana kashe {{cac}}. Menene rabon LTV zuwa CAC (zuwa lamba ɗaya bayan goma)?",
     "how": "LTV = biyan wata × gross margin × watanni; rabo = LTV ÷ CAC. Masu zuba jari suna son ganin 3× ko fiye."
    },
    "dilution": {
     "name": "Ragewa",
     "q": "Kana da {{own}} na kamfaninka. Wani mai saka jari ya saka {{invest}} a kan kimar kafin saka jari ta {{pre}}. Menene naka bayan zagayen (zuwa lamba ɗaya bayan goma)?",
     "how": "Sabon kaso = tsohon kaso × pre-money ÷ post-money, inda post-money = pre-money + jari."
    },
    "evMultiple": {
     "name": "Kima ta ninkawa",
     "q": "Wani kamfani yana samun EBITDA na {{ebitda}}. Kamfanoni makamantansu suna sayarwa a {{multiple}}× EBITDA. Yana da bashi {{debt}} da kuɗi {{cash}}. Menene darajar hannun jarin sa?",
     "how": "Darajar kamfani = EBITDA × ninkawa. Darajar hannun jari = darajar kamfani − bashi + kuɗi."
    },
    "dcfPerpetuity": {
     "name": "DCF tare da girma",
     "q": "Shekara mai zuwa kamfani zai samar da free cash flow na {{fcf}}, yana girma {{g}} a shekara har abada. Kuɗin jarin sa shine {{r}}. Menene ƙimar kasuwancinsa?",
     "how": "Ƙima = free cash flow na shekara mai zuwa ÷ (kuɗin jari − girma)."
    },
    "convertible": {
     "name": "Takardar canzawa",
     "q": "Takardar canzawa ta {{note}} tana canzawa a rangwamen {{discount}} zuwa farashin zagaye na gaba na {{price}} kowace hannu. Hannu nawa mai saka jari zai samu (zuwa hannu mafi kusa)?",
     "how": "Farashin canzawa = farashin zagaye × (1 − rangwame); hannu = takarda ÷ farashin canzawa."
    },
    "twoStageDcf": {
     "name": "DCF mataki biyu",
     "q": "Free cash flow shine {{fcf}} a wannan shekara. Zai girma {{g1}} a shekara na shekaru uku masu zuwa, sannan {{g2}} a shekara har abada. Kuɗin jari shine {{r}}. Menene ƙimar kasuwancin yau (zuwa dala mafi kusa)?",
     "how": "Rage kuɗin shiga na shekaru 1–3, sannan ƙara darajar ƙarshe a shekara 3 = FCF₃ × (1 + g₂) ÷ (r − g₂), an rage shekaru uku."
    }
   }
  },
  "charts": {
   "cash": "Kuɗi",
   "value": "Darajar kamfani",
   "goal": "Manufa",
   "month": "Wata {{n}}",
   "quarter": "Q{{n}}",
   "day": "Rana {{n}}",
   "week": "Mako {{n}}",
   "portfolio": "Jarin ka",
   "index": "Asusun index",
   "revenue": "Kuɗin shiga",
   "costs": "Jimillar kuɗi",
   "profit": "Riba",
   "customers": "Abokan ciniki",
   "price": "Farashi",
   "units": "Raka'a",
   "breakEven": "Matsayin daidaito",
   "demand": "Buƙata",
   "yourPrice": "Farashinka",
   "allocation": "Rarraba",
   "needs": "Bukatu",
   "wants": "Burirai",
   "savings": "Ajiya",
   "chartA11y": "{{title}}: {{summary}}"
  }
 },
 "fr": {
  "games": {
   "startup-tycoon": {
    "tagline": "Dirigez une entreprise mois par mois, puis valorisez-la comme un analyste.",
    "rules": {
     "r1": "Chaque mois, choisissez votre équipe, votre marketing et une réponse à un dilemme de gestion. Le serveur simule le mois et vous envoie votre compte de résultat.",
     "r2": "Faites croître la valeur de l’entreprise jusqu’à l’objectif sans manquer de liquidités. Une mauvaise décision ou une faillite coûte une vie.",
     "r3": "À partir de Débutant, le bureau de l’analyste à la fin interroge vos chiffres : marges, runway, et au sommet dilution et valorisation DCF.",
     "example": "Chiffre d’affaires 9 000 $ − coût des ventes 3 000 $ = marge brute 6 000 $ ; après 5 200 $ de salaires et loyer, le mois a rapporté 800 $."
    }
   },
   "budget-master": {
    "tagline": "Planifiez chaque dollar, de l’argent de poche au remboursement des dettes.",
    "rules": {
     "r1": "Chaque mois, payez les factures, puis répartissez le reste : nourriture, loisirs, vêtements, fonds d’urgence, objectif d’épargne et remboursements supplémentaires. Chaque dollar doit avoir un rôle.",
     "r2": "Puis un imprévu survient : choisissez comment le gérer. Sauter un repas ou un mauvais choix coûte une vie.",
     "r3": "Les niveaux supérieurs apportent loyer, dette de carte avec intérêts et revenus irréguliers ; le bureau de l’analyste interroge sur les intérêts, les prêts, les impôts et l’épargne retraite.",
     "example": "400 $ d’argent de poche : 60 $ de factures, 80 $ de nourriture, 40 $ de loisirs, 220 $ épargnés (55 %)."
    }
   },
   "market-master": {
    "tagline": "Fixez le prix d’un stand, puis lisez les marchés comme un économiste.",
    "rules": {
     "r1": "Chaque jour, fixez votre prix et la quantité de stock à acheter. Météo, affluence et un rival changent le nombre de clients.",
     "r2": "Le stock invendu est perdu et une perte coûte une vie. Plus vous approchez du meilleur profit, plus vous gagnez de points.",
     "r3": "L’étude de marché disparaît à partir d’Intermédiaire avancé ; le bureau de l’analyste va du chiffre d’affaires à l’élasticité, au monopole, à la concentration et à la concurrence de Cournot.",
     "example": "60 tasses vendues à 1,50 $ font 90 $ de chiffre d’affaires ; avec 70 tasses achetées à 0,50 $ et 10 $ de frais, le profit est de 45 $."
    }
   },
   "profit-quest": {
    "tagline": "Maîtrisez les maths du profit, puis dirigez une usine semaine par semaine.",
    "rules": {
     "r1": "Maths commerciales et semaines d’usine alternent. Calculez chaque somme, puis choisissez une réponse.",
     "r2": "Pour une semaine d’usine, fixez le prix et la quantité à produire ; les invendus coûtent du stockage. Une perte coûte une vie.",
     "r3": "Les calculs montent de la marge sur coût variable et du seuil de rentabilité au levier opérationnel, à la NPV et au coût du capital, avec un chrono plus court.",
     "example": "Prix 40 $, coût de production 25 $ : chaque vente contribue 15 $. Des coûts fixes de 1 500 $ exigent 100 ventes pour atteindre le seuil de rentabilité."
    }
   },
   "market-simulator": {
    "tagline": "Investissez de l’argent fictif et apprenez risque, rendement et valorisation.",
    "rules": {
     "r1": "Chaque trimestre, lisez les actualités et répartissez votre argent entre liquidités, obligations, fonds indiciel et entreprises fictives (le total doit faire 100 %).",
     "r2": "Répondez à la question d’investissement du trimestre. Battre l’indice et diversifier le risque rapportent des points ; une mauvaise réponse coûte une vie.",
     "r3": "Frais et limites sur une entreprise arrivent à Intermédiaire avancé ; le bureau de l’analyste va jusqu’au CAPM, aux prix des obligations et au risque de portefeuille.",
     "example": "60 % dans un fonds indiciel qui a monté de 5 % et 40 % en obligations qui ont monté de 1 % : le portefeuille a monté de 3,4 %."
    }
   }
  },
  "analyst": {
   "eyebrow": "BUREAU DE L’ANALYSTE",
   "step": "Question {{n}} sur {{total}}",
   "intro": "Calculez sur papier ou à la calculatrice, puis choisissez.",
   "check": "Vérifier la réponse",
   "right": "Correct",
   "wrong": "Pas tout à fait",
   "answerWas": "La réponse est {{answer}}.",
   "timeUp": "Temps écoulé",
   "method": "MÉTHODE",
   "next": "Suivant",
   "review": "Bureau de l’analyste",
   "kinds": {
    "saveWeeks": {
     "name": "Épargner",
     "q": "Vous épargnez {{weekly}} par semaine pour un casque qui coûte {{target}}. Combien de semaines avant de pouvoir l’acheter ?",
     "how": "Semaines = prix ÷ épargne hebdomadaire, arrondi au supérieur : une semaine entamée compte comme une semaine de plus."
    },
    "shareOf": {
     "name": "Part du salaire",
     "q": "Votre salaire net est de {{income}} par mois. Combien font {{share}} ?",
     "how": "Montant = salaire × pourcentage ÷ 100. La règle 50/30/20 : 50 % besoins, 30 % envies, 20 % épargne."
    },
    "simpleInterest": {
     "name": "Intérêt simple",
     "q": "Vous empruntez {{principal}} à {{rate}} d’intérêt simple par an pendant {{years}} ans. Combien d’intérêts payez-vous au total ?",
     "how": "Intérêt simple = principal × taux × années. Les intérêts ne portent que sur le montant initialement emprunté."
    },
    "cardInterest": {
     "name": "Intérêts de carte",
     "q": "Votre solde de carte de crédit est de {{balance}} et la carte facture {{rate}} d’intérêts par mois. Si vous ne payez rien, combien d’intérêts sont ajoutés ce mois-ci ?",
     "how": "Intérêts mensuels = solde × taux mensuel. Non payés, ils s’ajoutent au solde et produisent eux aussi des intérêts."
    },
    "compound": {
     "name": "Croissance composée",
     "q": "Vous investissez {{principal}} à {{rate}} par an, composé une fois par an, pendant {{years}} ans. Quelle est la valeur finale (au dollar près) ?",
     "how": "Valeur = principal × (1 + taux)^années. Les intérêts de chaque année produisent des intérêts les années suivantes."
    },
    "realRate": {
     "name": "Rendement réel",
     "q": "Votre épargne rapporte {{nominal}} par an tandis que les prix augmentent de {{inflation}} par an. Quel est votre rendement réel (à une décimale) ?",
     "how": "Rendement réel = (1 + taux nominal) ÷ (1 + inflation) − 1. Nominal moins inflation n’est qu’une approximation."
    },
    "ear": {
     "name": "Taux annuel effectif",
     "q": "Une carte facture {{monthly}} d’intérêts par mois, composés mensuellement. Quel est le taux annuel effectif (à une décimale) ?",
     "how": "Taux annuel effectif = (1 + taux mensuel)^12 − 1. Il est supérieur à 12 × le taux mensuel car les intérêts se composent."
    },
    "loanPayment": {
     "name": "Remboursement de prêt",
     "q": "Vous empruntez {{principal}} à {{rate}} par an, remboursé en mensualités égales sur {{years}} ans (intérêts mensuels). Quelle est la mensualité ?",
     "how": "Mensualité = P × i ÷ (1 − (1 + i)^−n), avec i = taux annuel ÷ 12 et n = nombre de mois."
    },
    "taxBands": {
     "name": "Tranches d’imposition",
     "q": "Revenu : {{income}}. L’impôt est de 0 % sur les premiers {{band1}}, de {{rate2}} sur le revenu de {{band1}} à {{band2}}, et de {{rate3}} sur tout ce qui dépasse {{band2}}. Quel est le montant total de l’impôt ?",
     "how": "Imposez chaque tranche de revenu à son propre taux et additionnez les tranches. Une tranche supérieure ne taxe jamais le revenu en dessous."
    },
    "retirement": {
     "name": "Épargner pour la retraite",
     "q": "Vous épargnez {{payment}} à la fin de chaque année pendant {{years}} ans à {{rate}} par an. Quelle est la valeur du pot après le dernier versement (au dollar près) ?",
     "how": "Valeur future d’une annuité = versement × ((1 + taux)^années − 1) ÷ taux."
    },
    "revenue": {
     "name": "Chiffre d’affaires",
     "q": "Vous vendez {{qty}} tasses à {{price}} chacune. Chaque tasse vous coûte {{cost}} à produire. Quel est votre chiffre d’affaires ?",
     "how": "Chiffre d’affaires = quantité vendue × prix. Le chiffre d’affaires est avant tout coût ; le profit est ce qui reste après."
    },
    "profitDay": {
     "name": "Le profit d’une journée",
     "q": "Vous achetez {{bought}} articles à {{cost}} chacun et payez {{fee}} de frais de stand. Vous en vendez {{qty}} à {{price}} chacun, et le reste est perdu. Quel est votre profit ?",
     "how": "Profit = ventes × prix − tout ce que vous avez acheté × son coût − frais fixes. Le stock invendu reste un coût."
    },
    "demandAt": {
     "name": "Lire la demande",
     "q": "À {{p1}} vous avez {{q1}} clients ; à {{p2}} vous en avez {{q2}}. La demande baisse en ligne droite. Combien de clients auriez-vous à {{p3}} ?",
     "how": "Une droite perd le même nombre de clients pour chaque dollar supplémentaire : trouvez cette pente, puis prolongez-la."
    },
    "elasticity": {
     "name": "Élasticité-prix",
     "q": "Quand le prix passe de {{p1}} à {{p2}}, les ventes chutent de {{q1}} à {{q2}}. Avec la méthode du point milieu, quelle est l’élasticité-prix de la demande (en nombre positif, à deux décimales) ?",
     "how": "Élasticité = (variation de Q ÷ Q moyen) ÷ (variation de P ÷ P moyen). Au-dessus de 1 : élastique ; en dessous de 1 : inélastique."
    },
    "bestPrice": {
     "name": "Le meilleur prix",
     "q": "Clients par jour = {{a}} − {{b}} × prix, et chaque article vous coûte {{cost}}. Quel prix maximise le profit ?",
     "how": "Avec une demande linéaire, le prix qui maximise le profit est à mi-chemin entre le coût et le prix où personne n’achète : (a ÷ b + coût) ÷ 2."
    },
    "monopolyQ": {
     "name": "Production de monopole",
     "q": "Un monopole fait face à la courbe de demande P = {{A}} − {{B}}Q et a un coût marginal constant de {{mc}}. Quelle quantité maximise son profit (à une décimale) ?",
     "how": "Égalisez recette marginale et coût marginal : RM = A − 2BQ, donc Q = (A − MC) ÷ 2B."
    },
    "hhi": {
     "name": "Concentration du marché",
     "q": "Les {{firms}} entreprises d’un marché ont des parts de {{shares}}. Quel est l’indice Herfindahl–Hirschman (HHI) ?",
     "how": "HHI = la somme des parts de marché au carré de chaque entreprise (en %). Au-dessus de 2 500, on considère généralement le marché très concentré."
    },
    "cournot": {
     "name": "Duopole (Cournot)",
     "q": "Deux entreprises identiques se concurrencent sur les quantités. La demande du marché est P = {{A}} − {{B}}(q₁ + q₂) et chacune a un coût marginal constant de {{mc}}. À l’équilibre de Cournot, combien chacune produit-elle (à une décimale) ?",
     "how": "La meilleure réponse de chaque entreprise est q = (A − MC − Bq_autre) ÷ 2B ; avec des entreprises identiques, q = (A − MC) ÷ 3B."
    },
    "deadweight": {
     "name": "Perte sèche",
     "q": "Un monopole fait face à P = {{A}} − {{B}}Q avec un coût marginal constant de {{mc}}. Comparé à la concurrence parfaite, quelle est la perte sèche (au dollar près) ?",
     "how": "Le monopole produit Q = (A − MC) ÷ 2B, soit la moitié du Q concurrentiel = (A − MC) ÷ B. Le triangle perdu est (A − MC)² ÷ 8B."
    },
    "operatingLeverage": {
     "name": "Levier opérationnel",
     "q": "Vous vendez {{units}} unités à {{price}} ; chacune coûte {{unit}} à produire, et les coûts fixes sont de {{fixed}}. Quel est le degré de levier opérationnel (à deux décimales) ?",
     "how": "DOL = marge sur coûts variables totale ÷ résultat d'exploitation. Un DOL de 3 signifie qu'une variation de 1 % des ventes modifie le profit d'environ 3 %."
    },
    "npv": {
     "name": "Valeur actuelle nette",
     "q": "Une machine coûte {{cost}} aujourd'hui et rapporte {{cash}} à la fin de chaque année pendant {{years}} ans. À un taux d'actualisation de {{rate}}, quelle est sa NPV (au dollar près) ?",
     "how": "NPV = cash × (1 − (1 + r)^−years) ÷ r − cost. Investissez lorsque la NPV est positive."
    },
    "wacc": {
     "name": "Coût du capital",
     "q": "Une entreprise a {{equity}} de capitaux propres coûtant {{re}} et {{debt}} de dette coûtant {{rd}} avant impôt. Le taux d'impôt est de {{tax}}. Quel est son WACC (à deux décimales) ?",
     "how": "WACC = E ÷ V × coût des capitaux propres + D ÷ V × coût de la dette × (1 − tax), où V = E + D. Les intérêts sont déductibles fiscalement."
    },
    "projectNpv": {
     "name": "Évaluation de projet",
     "q": "Une entreprise avec {{equity}} de capitaux propres (coût {{re}}) et {{debt}} de dette (coût {{rd}} avant impôt, taux d'impôt {{tax}}) envisage un projet coûtant {{cost}} qui rapporte {{cash}} à la fin de chaque année pendant {{years}} ans. Actualisé au WACC de l'entreprise, quelle est la NPV du projet (au dollar près) ?",
     "how": "D'abord le WACC = E ÷ V × re + D ÷ V × rd × (1 − tax) ; puis NPV = cash × (1 − (1 + WACC)^−years) ÷ WACC − cost."
    },
    "dividendYield": {
     "name": "Rendement du dividende",
     "q": "Une action coûte {{price}} et verse un dividende de {{dividend}} par an. Quel est son rendement du dividende (à une décimale) ?",
     "how": "Rendement du dividende = dividende annuel ÷ cours de l'action × 100."
    },
    "portfolioReturn": {
     "name": "Rendement du portefeuille",
     "q": "Vous placez {{w1}} de votre argent dans un fonds qui a rapporté {{r1}} et {{w2}} dans un autre qui a rapporté {{r2}}. Quel a été le rendement de votre portefeuille global ?",
     "how": "Rendement du portefeuille = poids de chaque placement × son rendement, additionnés."
    },
    "peValue": {
     "name": "Prix à partir du P/E",
     "q": "Une entreprise gagne {{eps}} par action. Des entreprises similaires se négocient à un ratio cours/bénéfice de {{pe}}. Quel cours de l'action cela suggère-t-il ?",
     "how": "Prix = bénéfice par action × ratio P/E."
    },
    "capm": {
     "name": "CAPM",
     "q": "Le taux sans risque est de {{rf}}, le marché devrait rapporter {{rm}}, et une action a un bêta de {{beta}}. Avec le CAPM, quel rendement les investisseurs doivent-ils attendre (à une décimale) ?",
     "how": "Rendement attendu = taux sans risque + bêta × (rendement du marché − taux sans risque)."
    },
    "sharpe": {
     "name": "Ratio de Sharpe",
     "q": "Un fonds a rapporté {{rp}} avec un écart-type de {{sd}} ; le taux sans risque était de {{rf}}. Quel est son ratio de Sharpe (à deux décimales) ?",
     "how": "Ratio de Sharpe = (rendement − taux sans risque) ÷ écart-type : le rendement supplémentaire obtenu par unité de risque."
    },
    "gordon": {
     "name": "Modèle d'actualisation des dividendes",
     "q": "Une action vient de verser un dividende de {{d0}}. Les dividendes croissent de {{g}} par an indéfiniment et les investisseurs exigent {{r}}. Quelle est la valeur de l'action (modèle de croissance de Gordon) ?",
     "how": "Valeur = dividende de l'année prochaine ÷ (rendement exigé − croissance) = D₀ × (1 + g) ÷ (r − g)."
    },
    "bondPrice": {
     "name": "Prix de l'obligation",
     "q": "Une obligation de valeur nominale {{face}} verse un coupon de {{coupon}} une fois par an et arrive à échéance dans {{years}} ans. Si le rendement du marché est de {{y}}, quel est son prix ?",
     "how": "Prix = les coupons actualisés comme une rente + la valeur nominale ÷ (1 + rendement)^années. Les prix baissent quand les rendements montent."
    },
    "twoAssetSd": {
     "name": "Risque du portefeuille",
     "q": "Vous placez {{w1}} dans l'actif A (écart-type {{s1}}) et {{w2}} dans l'actif B (écart-type {{s2}}). Leur corrélation est de {{rho}}. Quel est l'écart-type du portefeuille (à une décimale) ?",
     "how": "σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). En dessous d'une corrélation de 1, mélanger les actifs réduit le risque : la diversification."
    },
    "grossMargin": {
     "name": "Marge brute",
     "q": "Vous vendez un produit à {{price}}. Il coûte {{unit}} à produire et livrer. Quelle est votre marge brute (à une décimale) ?",
     "how": "Marge brute = (prix − coût de la vente) ÷ prix × 100."
    },
    "runway": {
     "name": "Autonomie financière",
     "q": "Une startup a {{cash}} en banque. Elle encaisse {{revenue}} par mois et dépense {{costs}} par mois. Pendant combien de mois entiers peut-elle continuer ?",
     "how": "Runway = trésorerie ÷ burn mensuel, où burn = coûts − revenus. Arrondir à l’inférieur : le dernier mois partiel n’est pas couvert."
    },
    "ltvCac": {
     "name": "LTV : CAC",
     "q": "Un client paie {{monthly}} par mois avec une marge brute de {{gm}} et reste {{months}} mois en moyenne. Acquérir chaque client coûte {{cac}}. Quel est le ratio LTV/CAC (à une décimale) ?",
     "how": "LTV = paiement mensuel × marge brute × mois ; ratio = LTV ÷ CAC. Les investisseurs aiment voir 3× ou plus."
    },
    "dilution": {
     "name": "Dilution",
     "q": "Vous détenez {{own}} de votre startup. Un investisseur apporte {{invest}} à une valorisation pre-money de {{pre}}. Que détenez-vous après le tour (à une décimale) ?",
     "how": "Nouvelle participation = ancienne participation × pre-money ÷ post-money, où post-money = pre-money + investissement."
    },
    "evMultiple": {
     "name": "Valorisation par multiple",
     "q": "Une entreprise réalise un EBITDA de {{ebitda}}. Des entreprises similaires se vendent {{multiple}}× l'EBITDA. Elle a {{debt}} de dette et {{cash}} de trésorerie. Quelle est la valeur de ses fonds propres ?",
     "how": "Valeur d'entreprise = EBITDA × multiple. Valeur des fonds propres = valeur d'entreprise − dette + trésorerie."
    },
    "dcfPerpetuity": {
     "name": "DCF avec croissance",
     "q": "L’an prochain, une entreprise générera un free cash flow de {{fcf}}, croissant de {{g}} par an à perpétuité. Son coût du capital est {{r}}. Quelle est sa valeur d’entreprise ?",
     "how": "Valeur = free cash flow de l’an prochain ÷ (coût du capital − croissance)."
    },
    "convertible": {
     "name": "Obligation convertible",
     "q": "Une obligation convertible de {{note}} se convertit avec une décote de {{discount}} au prix du prochain tour de {{price}} par action. Combien d'actions l'investisseur obtient-il (à l'action près) ?",
     "how": "Prix de conversion = prix du tour × (1 − décote) ; actions = note ÷ prix de conversion."
    },
    "twoStageDcf": {
     "name": "DCF à deux étapes",
     "q": "Le free cash flow est de {{fcf}} cette année. Il croîtra de {{g1}} par an pendant les trois prochaines années, puis de {{g2}} par an à perpétuité. Le coût du capital est de {{r}}. Quelle est la valeur d'entreprise aujourd'hui (à l'unité près) ?",
     "how": "Actualisez les cash-flows des années 1 à 3, puis ajoutez la valeur terminale en année 3 = FCF₃ × (1 + g₂) ÷ (r − g₂), actualisée sur trois ans."
    }
   }
  },
  "charts": {
   "cash": "Trésorerie",
   "value": "Valeur de l'entreprise",
   "goal": "Objectif",
   "month": "Mois {{n}}",
   "quarter": "T{{n}}",
   "day": "Jour {{n}}",
   "week": "Semaine {{n}}",
   "portfolio": "Votre portefeuille",
   "index": "Fonds indiciel",
   "revenue": "Chiffre d'affaires",
   "costs": "Coûts totaux",
   "profit": "Profit",
   "customers": "Clients",
   "price": "Prix",
   "units": "Unités",
   "breakEven": "Seuil de rentabilité",
   "demand": "Demande",
   "yourPrice": "Votre prix",
   "allocation": "Répartition",
   "needs": "Besoins",
   "wants": "Envies",
   "savings": "Épargne",
   "chartA11y": "{{title}} : {{summary}}"
  }
 },
 "ar": {
  "games": {
   "startup-tycoon": {
    "tagline": "أدر شركة شهراً بشهر، ثم قيّمها كمحلل مالي.",
    "rules": {
     "r1": "كل شهر، اختر فريقك وتسويقك وإجابة عن معضلة إدارية. يشغّل الخادم الشهر ويرسل أرباحك وخسائرك.",
     "r2": "ارفع قيمة الشركة إلى الهدف دون نفاد النقد. قرار سيئ أو إفلاس يكلفك قلباً.",
     "r3": "من المبتدئ، يسألك مكتب المحلل في النهاية عن أرقامك: الهوامش، ومدة كفاية النقد، وفي الأعلى التخفيف وتقييم DCF.",
     "example": "الإيرادات $9,000 − تكلفة المبيعات $3,000 = الربح الإجمالي $6,000؛ بعد $5,200 من الرواتب والإيجار، حقق الشهر $800."
    }
   },
   "budget-master": {
    "tagline": "خطط لكل دولار، من مصروف الجيب إلى سداد الدين.",
    "rules": {
     "r1": "كل شهر، ادفع الفواتير، ثم وزّع الباقي: طعام، ترفيه، ملابس، صندوق طوارئ، هدف ادخار ومدفوعات دين إضافية. لكل دولار مهمة.",
     "r2": "ثم يحدث شيء: اختر كيف تتعامل معه. تفويت الطعام أو خيار سيئ يكلفك قلباً.",
     "r3": "المستويات الأعلى تجلب الإيجار ودين البطاقة بفائدة وراتباً غير منتظم؛ يسألك مكتب المحلل عن الفائدة والقروض والضريبة والادخار للتقاعد.",
     "example": "$400 مصروف جيب: $60 فواتير، $80 طعام، $40 ترفيه، $220 مدخرات (55%)."
    }
   },
   "market-master": {
    "tagline": "سعّر كشك سوق، ثم اقرأ الأسواق كخبير اقتصادي.",
    "rules": {
     "r1": "كل يوم، حدد سعرك وكمية المخزون التي تشتريها. الطقس والزحام والمنافس يغيّرون عدد العملاء.",
     "r2": "المخزون غير المباع يهدر والخسارة تكلفك قلباً. كلما اقتربت من أفضل ربح، زادت النقاط.",
     "r3": "يختفي بحث السوق من فوق المتوسط؛ ينتقل مكتب المحلل من الإيرادات إلى المرونة والاحتكار والتركيز ومنافسة كورنو.",
     "example": "بيع 60 كوباً بسعر $1.50 يعني إيرادات $90؛ مع شراء 70 كوباً بسعر $0.50 ورسوم $10، الربح $45."
    }
   },
   "profit-quest": {
    "tagline": "أتقن رياضيات الربح، ثم أدر مصنعاً أسبوعاً بأسبوع.",
    "rules": {
     "r1": "تتناوب رياضيات الأعمال وأسابيع المصنع. احسب كل مسألة، ثم اختر إجابة.",
     "r2": "في أسبوع المصنع، حدد السعر وكمية الإنتاج؛ الفائض يكلف تخزيناً. الخسارة تكلفك قلباً.",
     "r3": "تتصاعد المسائل من المساهمة ونقطة التعادل إلى الرفع التشغيلي وNPV وتكلفة رأس المال، مع وقت أقصر.",
     "example": "السعر $40، تكلفة الصنع $25: كل بيع يساهم بـ$15. التكاليف الثابتة $1,500 تحتاج 100 بيع للتعادل."
    }
   },
   "market-simulator": {
    "tagline": "استثمر مالاً تدريبياً وتعلم المخاطر والعائد والتقييم.",
    "rules": {
     "r1": "كل ربع سنة، اقرأ الأخبار ووزّع مالك بين النقد والسندات وصندوق مؤشر وشركات متخيلة (يجب أن يجمع إلى 100%).",
     "r2": "أجب عن سؤال الاستثمار الفصلي. التغلب على المؤشر وتوزيع المخاطر يكسبان نقاطاً؛ الإجابة الخاطئة تكلفك قلباً.",
     "r3": "تصل الرسوم وحدود الشركة الواحدة في فوق المتوسط؛ يمتد مكتب المحلل إلى CAPM وأسعار السندات ومخاطر المحفظة.",
     "example": "60% في صندوق مؤشر ارتفع 5% و40% في سندات ارتفعت 1%: ارتفعت المحفظة 3.4%."
    }
   }
  },
  "analyst": {
   "eyebrow": "مكتب المحلل",
   "step": "السؤال {{n}} من {{total}}",
   "intro": "احسبها على الورق أو بالآلة الحاسبة، ثم اختر.",
   "check": "تحقق من الإجابة",
   "right": "صحيح",
   "wrong": "ليس تماماً",
   "answerWas": "الإجابة هي {{answer}}.",
   "timeUp": "انتهى الوقت",
   "method": "الطريقة",
   "next": "التالي",
   "review": "مكتب المحلل",
   "kinds": {
    "saveWeeks": {
     "name": "الادخار",
     "q": "تدخر {{weekly}} أسبوعياً لسماعات تكلف {{target}}. كم أسبوعاً حتى تستطيع شراءها؟",
     "how": "الأسابيع = السعر ÷ الادخار الأسبوعي، مقرباً لأعلى: جزء الأسبوع يعني انتظار أسبوع آخر."
    },
    "shareOf": {
     "name": "حصة من الراتب",
     "q": "راتبك الصافي {{income}} شهرياً. كم يساوي {{share}} منه؟",
     "how": "المبلغ = الراتب × النسبة ÷ 100. قاعدة 50/30/20: 50% احتياجات، 30% رغبات، 20% مدخرات."
    },
    "simpleInterest": {
     "name": "الفائدة البسيطة",
     "q": "تقترض {{principal}} بفائدة بسيطة {{rate}} سنوياً لمدة {{years}} سنوات. كم فائدة تدفع إجمالاً؟",
     "how": "الفائدة البسيطة = المبلغ الأصلي × المعدل × السنوات. تُحتسب الفائدة فقط على المبلغ المقترض أولاً."
    },
    "cardInterest": {
     "name": "فائدة البطاقة",
     "q": "رصيد بطاقتك الائتمانية {{balance}} وتفرض البطاقة فائدة {{rate}} شهريًا. إذا لم تدفع شيئًا، فكم فائدة تُضاف هذا الشهر؟",
     "how": "الفائدة الشهرية = الرصيد × المعدل الشهري. إذا لم تُدفع، تُضاف إلى الرصيد وتكسب فائدة أيضًا."
    },
    "compound": {
     "name": "النمو المركّب",
     "q": "تستثمر {{principal}} بمعدل {{rate}} سنويًا، يُركّب مرة واحدة سنويًا، لمدة {{years}} سنوات. كم تساوي في النهاية (لأقرب دولار)؟",
     "how": "القيمة = رأس المال × (1 + المعدل)^السنوات. فائدة كل سنة تكسب فائدة في السنوات التالية."
    },
    "realRate": {
     "name": "العائد الحقيقي",
     "q": "تحقق مدخراتك {{nominal}} سنويًا بينما ترتفع الأسعار {{inflation}} سنويًا. ما عائدك الحقيقي (إلى منزلة عشرية واحدة)؟",
     "how": "العائد الحقيقي = (1 + المعدل الاسمي) ÷ (1 + التضخم) − 1. طرح التضخم من الاسمي تقريب فقط."
    },
    "ear": {
     "name": "المعدل السنوي الفعلي",
     "q": "تفرض بطاقة فائدة {{monthly}} شهريًا تُركّب شهريًا. ما المعدل السنوي الفعلي (إلى منزلة عشرية واحدة)؟",
     "how": "المعدل السنوي الفعلي = (1 + المعدل الشهري)^12 − 1. وهو أعلى من 12 × المعدل الشهري لأن الفائدة تُركّب."
    },
    "loanPayment": {
     "name": "سداد القرض",
     "q": "تقترض {{principal}} بمعدل {{rate}} سنويًا، تُسدَّد بأقساط شهرية متساوية على {{years}} سنوات (تُحتسب الفائدة شهريًا). ما القسط الشهري؟",
     "how": "القسط = P × i ÷ (1 − (1 + i)^−n)، حيث i = المعدل السنوي ÷ 12 وn = عدد الأشهر."
    },
    "taxBands": {
     "name": "شرائح الضريبة",
     "q": "الدخل: {{income}}. الضريبة 0% على أول {{band1}}، و{{rate2}} على الدخل من {{band1}} إلى {{band2}}، و{{rate3}} على كل ما يزيد على {{band2}}. كم مجموع الضريبة المستحقة؟",
     "how": "اضرب كل شريحة دخل بمعدلها ثم اجمع الشرائح. الشريحة الأعلى لا تفرض ضريبة على الدخل الأدنى منها."
    },
    "retirement": {
     "name": "الادخار للتقاعد",
     "q": "تدّخر {{payment}} في نهاية كل سنة لمدة {{years}} سنوات بمعدل {{rate}} سنويًا. كم تساوي المحصلة بعد آخر دفعة (لأقرب دولار)؟",
     "how": "القيمة المستقبلية للقسط السنوي = الدفعة × ((1 + المعدل)^السنوات − 1) ÷ المعدل."
    },
    "revenue": {
     "name": "الإيراد",
     "q": "تبيع {{qty}} كوبًا بسعر {{price}} لكل كوب. تكلفة صنع كل كوب {{cost}}. ما إيرادك؟",
     "how": "الإيراد = الكمية المباعة × السعر. الإيراد قبل أي تكاليف؛ الربح هو ما يتبقى بعدها."
    },
    "profitDay": {
     "name": "ربح يوم واحد",
     "q": "تشتري {{bought}} قطعة بتكلفة {{cost}} لكل قطعة وتدفع رسوم منصة {{fee}}. تبيع {{qty}} منها بسعر {{price}} لكل قطعة، والباقي يهدر. ما ربحك؟",
     "how": "الربح = المبيعات × السعر − كل ما اشتريته × تكلفته − الرسوم الثابتة. المخزون غير المباع تكلفة أيضًا."
    },
    "demandAt": {
     "name": "قراءة الطلب",
     "q": "عند {{p1}} تحصل على {{q1}} عميل؛ وعند {{p2}} تحصل على {{q2}}. ينخفض الطلب على خط مستقيم. كم عميلًا ستحصل عليه عند {{p3}}؟",
     "how": "الخط المستقيم يفقد العدد نفسه من العملاء لكل دولار إضافي: أوجد هذا الميل ثم واصل به."
    },
    "elasticity": {
     "name": "مرونة السعر",
     "q": "عندما يرتفع السعر من {{p1}} إلى {{p2}}، تنخفض المبيعات من {{q1}} إلى {{q2}}. باستخدام طريقة نقطة المنتصف، ما مرونة الطلب السعرية (كعدد موجب، إلى منزلتين عشريتين)؟",
     "how": "المرونة = (التغير في Q ÷ متوسط Q) ÷ (التغير في P ÷ متوسط P). فوق 1 مرن؛ وتحت 1 غير مرن."
    },
    "bestPrice": {
     "name": "أفضل سعر",
     "q": "العملاء يوميًا = {{a}} − {{b}} × السعر، وتكلفة كل قطعة {{cost}}. أي سعر يحقق أكبر ربح؟",
     "how": "مع طلب خطي، السعر المعظّم للربح هو منتصف المسافة بين التكلفة والسعر الذي لا يشتري عنده أحد: (a ÷ b + التكلفة) ÷ 2."
    },
    "monopolyQ": {
     "name": "إنتاج الاحتكار",
     "q": "يواجه محتكر منحنى طلب P = {{A}} − {{B}}Q وله تكلفة حدية ثابتة {{mc}}. ما الكمية التي تعظّم ربحه (إلى منزلة عشرية واحدة)؟",
     "how": "اجعل الإيراد الحدّي مساويًا للتكلفة الحدية: MR = A − 2BQ، إذن Q = (A − MC) ÷ 2B."
    },
    "hhi": {
     "name": "تركّز السوق",
     "q": "لدى {{firms}} شركات في سوق حصص {{shares}}. ما مؤشر هيرفندال–هيرشمان (HHI)؟",
     "how": "HHI = مجموع مربعات حصة كل شركة في السوق (بالـ %). فوق 2,500 يُعد عادةً تركّزًا مرتفعًا."
    },
    "cournot": {
     "name": "احتكار ثنائي (كورنو)",
     "q": "تتنافس شركتان متماثلتان على الكمية. طلب السوق P = {{A}} − {{B}}(q₁ + q₂) ولكل منهما تكلفة حدية ثابتة {{mc}}. في توازن كورنو، كم تنتج كل شركة (إلى منزلة عشرية واحدة)؟",
     "how": "أفضل استجابة لكل شركة هي q = (A − MC − Bq_other) ÷ 2B؛ ومع شركات متماثلة، q = (A − MC) ÷ 3B."
    },
    "deadweight": {
     "name": "خسارة الرفاهية",
     "q": "تواجه شركة احتكارية P = {{A}} − {{B}}Q بتكلفة حدية ثابتة مقدارها {{mc}}. بالمقارنة مع المنافسة الكاملة، ما مقدار خسارة الرفاهية (إلى أقرب دولار)؟",
     "how": "تنتج الشركة الاحتكارية Q = (A − MC) ÷ 2B، أي نصف الكمية التنافسية Q = (A − MC) ÷ B. المثلث المفقود هو (A − MC)² ÷ 8B."
    },
    "operatingLeverage": {
     "name": "الرفع التشغيلي",
     "q": "تبيع {{units}} وحدة بسعر {{price}}؛ تكلفة إنتاج كل وحدة {{unit}}، والتكاليف الثابتة {{fixed}}. ما درجة الرفع التشغيلي (إلى منزلتين عشريتين)؟",
     "how": "DOL = إجمالي المساهمة ÷ الربح التشغيلي. درجة رفع تشغيلي 3 تعني أن تغيراً بنسبة 1% في المبيعات يحرك الربح بنحو 3%."
    },
    "npv": {
     "name": "صافي القيمة الحالية",
     "q": "تكلف آلة {{cost}} اليوم وتدر {{cash}} في نهاية كل سنة لمدة {{years}} سنة. بمعدل خصم {{rate}}، ما صافي قيمتها الحالية (إلى أقرب دولار)؟",
     "how": "NPV = cash × (1 − (1 + r)^−years) ÷ r − cost. استثمر عندما تكون NPV موجبة."
    },
    "wacc": {
     "name": "تكلفة رأس المال",
     "q": "لدى شركة {{equity}} من حقوق الملكية بتكلفة {{re}} و{{debt}} من الدين بتكلفة {{rd}} قبل الضريبة. معدل الضريبة {{tax}}. ما WACC لديها (إلى منزلتين عشريتين)؟",
     "how": "WACC = E ÷ V × تكلفة حقوق الملكية + D ÷ V × تكلفة الدين × (1 − tax)، حيث V = E + D. الفائدة قابلة للخصم الضريبي."
    },
    "projectNpv": {
     "name": "تقييم المشروع",
     "q": "تدرس شركة لديها {{equity}} من حقوق الملكية (تكلفة {{re}}) و{{debt}} من الدين (تكلفة {{rd}} قبل الضريبة، معدل الضريبة {{tax}}) مشروعاً يكلف {{cost}} ويعيد {{cash}} في نهاية كل سنة لمدة {{years}} سنة. مخصوماً بـ WACC للشركة، ما NPV للمشروع (إلى أقرب دولار)؟",
     "how": "أولاً WACC = E ÷ V × re + D ÷ V × rd × (1 − tax)؛ ثم NPV = cash × (1 − (1 + WACC)^−years) ÷ WACC − cost."
    },
    "dividendYield": {
     "name": "عائد التوزيعات",
     "q": "يكلف السهم {{price}} ويدفع توزيعات قدرها {{dividend}} سنوياً. ما عائد التوزيعات (إلى منزلة عشرية واحدة)؟",
     "how": "عائد التوزيعات = التوزيع السنوي ÷ سعر السهم × 100."
    },
    "portfolioReturn": {
     "name": "عائد المحفظة",
     "q": "تحتفظ بـ {{w1}} من أموالك في صندوق عائدته {{r1}} و{{w2}} في صندوق عائدته {{r2}}. ما عائد محفظتك كاملة؟",
     "how": "عائد المحفظة = وزن كل حيازة × عائدها، مجموعاً."
    },
    "peValue": {
     "name": "السعر من P/E",
     "q": "تحقق شركة {{eps}} ربحاً للسهم. تتداول شركات مماثلة عند نسبة سعر/ربح {{pe}}. ما سعر السهم الذي يشير إليه ذلك؟",
     "how": "السعر = ربحية السهم × نسبة P/E."
    },
    "capm": {
     "name": "CAPM",
     "q": "المعدل الخالي من المخاطر {{rf}}، ويُتوقع أن يعود السوق بـ {{rm}}، ولسهم بيتا {{beta}}. باستخدام CAPM، ما العائد الذي ينبغي أن يتوقعه المستثمرون (إلى منزلة عشرية واحدة)؟",
     "how": "العائد المتوقع = المعدل الخالي من المخاطر + beta × (عائد السوق − المعدل الخالي من المخاطر)."
    },
    "sharpe": {
     "name": "نسبة شارب",
     "q": "عاد صندوق بـ {{rp}} بانحراف معياري {{sd}}؛ وكان المعدل الخالي من المخاطر {{rf}}. ما نسبة شارب (إلى منزلتين عشريتين)؟",
     "how": "نسبة شارب = (العائد − المعدل الخالي من المخاطر) ÷ الانحراف المعياري: العائد الإضافي لكل وحدة مخاطرة."
    },
    "gordon": {
     "name": "نموذج خصم التوزيعات",
     "q": "سهم دفع للتو توزيعات قدرها {{d0}}. تنمو التوزيعات بنسبة {{g}} سنوياً إلى الأبد ويطلب المستثمرون {{r}}. ما قيمة السهم (نموذج نمو جوردون)؟",
     "how": "القيمة = توزيعات السنة القادمة ÷ (العائد المطلوب − النمو) = D₀ × (1 + g) ÷ (r − g)."
    },
    "bondPrice": {
     "name": "سعر السند",
     "q": "سند بقيمة اسمية {{face}} يدفع كوبوناً {{coupon}} مرة سنوياً ويستحق بعد {{years}} سنة. إذا كان عائد السوق {{y}}، فما سعره؟",
     "how": "السعر = القسائم مخصومة كمعاش سنوي + القيمة الاسمية ÷ (1 + العائد)^السنوات. تنخفض الأسعار عندما ترتفع العوائد."
    },
    "twoAssetSd": {
     "name": "مخاطر المحفظة",
     "q": "تضع {{w1}} في الأصل A (انحراف معياري {{s1}}) و{{w2}} في الأصل B (انحراف معياري {{s2}}). ارتباطهما {{rho}}. ما الانحراف المعياري للمحفظة (إلى منزلة عشرية واحدة)؟",
     "how": "σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). عند ارتباط أقل من 1، يخفض مزج الأصول المخاطر: التنويع."
    },
    "grossMargin": {
     "name": "الهامش الإجمالي",
     "q": "تبيع منتجاً بسعر {{price}}. تكلفة إنتاجه وتوصيله {{unit}}. ما هامشك الإجمالي (إلى منزلة عشرية واحدة)؟",
     "how": "الهامش الإجمالي = (السعر − تكلفة البيع) ÷ السعر × 100."
    },
    "runway": {
     "name": "المدى الزمني",
     "q": "لدى شركة ناشئة {{cash}} في البنك. تحقق {{revenue}} شهرياً وتنفق {{costs}} شهرياً. كم شهراً كاملاً يمكنها الاستمرار؟",
     "how": "المدى = النقد ÷ الحرق الشهري، حيث الحرق = التكاليف − الإيرادات. قرّب للأسفل: الجزء الأخير من الشهر غير مغطى."
    },
    "ltvCac": {
     "name": "LTV : CAC",
     "q": "يدفع العميل {{monthly}} شهريًا بهامش إجمالي {{gm}} ويبقى {{months}} شهرًا في المتوسط. تكلفة كسب كل عميل {{cac}}. ما نسبة LTV إلى CAC (إلى منزلة عشرية واحدة)؟",
     "how": "LTV = الدفعة الشهرية × الهامش الإجمالي × الأشهر؛ النسبة = LTV ÷ CAC. يفضّل المستثمرون رؤية 3× أو أكثر."
    },
    "dilution": {
     "name": "التخفيف",
     "q": "تملك {{own}} من شركتك الناشئة. يستثمر مستثمر {{invest}} بتقييم ما قبل الاستثمار {{pre}}. كم تملك بعد الجولة (إلى منزلة عشرية واحدة)؟",
     "how": "الحصة الجديدة = الحصة القديمة × ما قبل الاستثمار ÷ ما بعد الاستثمار، حيث ما بعد الاستثمار = ما قبل الاستثمار + الاستثمار."
    },
    "evMultiple": {
     "name": "التقييم بالمضاعف",
     "q": "تحقق شركة EBITDA قدره {{ebitda}}. تُباع شركات مماثلة بمضاعف {{multiple}}× EBITDA. لديها {{debt}} دينًا و{{cash}} نقدًا. ما قيمة حقوق ملكيتها؟",
     "how": "قيمة المنشأة = EBITDA × المضاعف. قيمة حقوق الملكية = قيمة المنشأة − الدين + النقد."
    },
    "dcfPerpetuity": {
     "name": "DCF مع النمو",
     "q": "ستولّد شركة العام القادم تدفقًا نقديًا حرًا قدره {{fcf}}، ينمو {{g}} سنويًا إلى الأبد. تكلفة رأس مالها {{r}}. ما قيمة منشأتها؟",
     "how": "القيمة = التدفق النقدي الحر للعام القادم ÷ (تكلفة رأس المال − النمو)."
    },
    "convertible": {
     "name": "سند قابل للتحويل",
     "q": "سند قابل للتحويل بقيمة {{note}} يُحوَّل بخصم {{discount}} عن سعر الجولة التالية البالغ {{price}} للسهم. كم سهمًا يحصل المستثمر (إلى أقرب سهم)؟",
     "how": "سعر التحويل = سعر الجولة × (1 − الخصم)؛ الأسهم = السند ÷ سعر التحويل."
    },
    "twoStageDcf": {
     "name": "DCF على مرحلتين",
     "q": "التدفق النقدي الحر {{fcf}} هذا العام. سينمو {{g1}} سنويًا للسنوات الثلاث القادمة، ثم {{g2}} سنويًا إلى الأبد. تكلفة رأس المال {{r}}. ما قيمة المنشأة اليوم (إلى أقرب دولار)؟",
     "how": "خصّم التدفقات النقدية للسنوات 1–3، ثم أضف القيمة النهائية في السنة 3 = FCF₃ × (1 + g₂) ÷ (r − g₂)، مخصومة ثلاث سنوات."
    }
   }
  },
  "charts": {
   "cash": "النقد",
   "value": "قيمة الشركة",
   "goal": "الهدف",
   "month": "الشهر {{n}}",
   "quarter": "الربع {{n}}",
   "day": "اليوم {{n}}",
   "week": "الأسبوع {{n}}",
   "portfolio": "محفظتك",
   "index": "صندوق مؤشر",
   "revenue": "الإيرادات",
   "costs": "إجمالي التكاليف",
   "profit": "الربح",
   "customers": "العملاء",
   "price": "السعر",
   "units": "الوحدات",
   "breakEven": "نقطة التعادل",
   "demand": "الطلب",
   "yourPrice": "سعرك",
   "allocation": "التوزيع",
   "needs": "الاحتياجات",
   "wants": "الرغبات",
   "savings": "المدخرات",
   "chartA11y": "{{title}}: {{summary}}"
  }
 },
 "sw": {
  "games": {
   "startup-tycoon": {
    "tagline": "Endesha kampuni mwezi kwa mwezi, kisha ithamini kama mchanganuzi.",
    "rules": {
     "r1": "Kila mwezi, chagua timu yako, masoko yako na jibu la tatizo la usimamizi. Seva inaendesha mwezi na kukutumia faida na hasara.",
     "r2": "Kukuza thamani ya kampuni hadi lengo bila kuishiwa pesa. Uamuzi mbaya au kufilisika hugharimu moyo mmoja.",
     "r3": "Kuanzia Mwanzo, dawati la mchanganuzi mwishoni huuliza kuhusu nambari zako: faida, muda wa pesa kudumu, na juu zaidi upunguzaji na thamani ya DCF.",
     "example": "Mapato $9,000 − gharama ya mauzo $3,000 = faida ghafi $6,000; baada ya $5,200 za mishahara na kodi ya nyumba, mwezi ulizalisha $800."
    }
   },
   "budget-master": {
    "tagline": "Panga kila dola, kutoka pesa za mfukoni hadi kulipa deni.",
    "rules": {
     "r1": "Kila mwezi, lipa bili, kisha gawanya kilichobaki: chakula, starehe, nguo, akiba ya dharura, lengo la akiba na malipo ya ziada ya deni. Kila dola lazima iwe na kazi.",
     "r2": "Kisha kitu kinatokea: chagua jinsi ya kukishughulikia. Kuruka chakula au uamuzi mbaya hugharimu moyo mmoja.",
     "r3": "Viwango vya juu huleta kodi ya nyumba, deni la kadi lenye riba na malipo yasiyo ya kawaida; dawati la mchambuzi huuliza kuhusu riba, mikopo, kodi na kuweka akiba kwa ajili ya uzeeni.",
     "example": "$400 za pesa za mfukoni: $60 za bili, $80 za chakula, $40 za starehe, $220 zimewekwa akiba (55%)."
    }
   },
   "market-master": {
    "tagline": "Weka bei kwenye kibanda cha soko, kisha soma masoko kama mwanauchumi.",
    "rules": {
     "r1": "Kila siku, weka bei yako na kiasi cha bidhaa cha kununua. Hali ya hewa, umati na mshindani hubadilisha idadi ya wateja wanaokuja.",
     "r2": "Bidhaa zisizouzwa hupotea na hasara hugharimu moyo mmoja. Kadiri unavyokaribia faida bora, ndivyo unavyopata pointi zaidi.",
     "r3": "Utafiti wa soko hupungua kuanzia Upper-intermediate; dawati la mchambuzi huenda kutoka mapato hadi elasticity, ukiritimba, mkusanyiko na ushindani wa Cournot.",
     "example": "Vikombe 60 vilivyouzwa kwa $1.50 ni $90 za mapato; ukiwa umenunua vikombe 70 kwa $0.50 na ada ya $10, faida ni $45."
    }
   },
   "profit-quest": {
    "tagline": "Bobea hisabati ya faida, kisha endesha kiwanda wiki kwa wiki.",
    "rules": {
     "r1": "Hisabati ya biashara na wiki za kiwanda hupishana. Hesabu kila jumla, kisha chagua jibu.",
     "r2": "Katika wiki ya kiwanda, weka bei na idadi ya kuzalisha; mabaki yanagharimu hifadhi. Hasara hugharimu moyo mmoja.",
     "r3": "Hesabu zinapanda kutoka mchango na kuvunja-sawa hadi nguvu ya uendeshaji, NPV na gharama ya mtaji, kwa muda mfupi zaidi.",
     "example": "Bei $40, gharama ya kuzalisha $25: kila mauzo huchangia $15. Gharama zisizobadilika za $1,500 zinahitaji mauzo 100 kuvunja-sawa."
    }
   },
   "market-simulator": {
    "tagline": "Wekeza pesa za mazoezi na ujifunze hatari, faida na thamani.",
    "rules": {
     "r1": "Kila robo mwaka, soma habari na gawanya pesa zako kati ya pesa taslimu, bondi, mfuko wa fahirisi na kampuni za kubuni (lazima jumla iwe 100%).",
     "r2": "Jibu swali la uwekezaji la robo mwaka. Kushinda fahirisi na kueneza hatari hupata pointi; jibu baya hugharimu moyo mmoja.",
     "r3": "Ada na mipaka kwa kampuni moja huja kuanzia Kiwango cha Kati cha Juu; dawati la mchanganuzi hupanda hadi CAPM, bei za bondi na hatari ya kwingineko.",
     "example": "60% katika mfuko wa fahirisi uliopanda 5% na 40% katika bondi zilizopanda 1%: kwingineko lilipanda 3.4%."
    }
   }
  },
  "analyst": {
   "eyebrow": "DAWATI LA MCHANGANUZI",
   "step": "Swali {{n}} kati ya {{total}}",
   "intro": "Ifanyie kazi kwenye karatasi au kwa kikokotoo, kisha chagua.",
   "check": "Angalia jibu",
   "right": "Sahihi",
   "wrong": "Sio sawa kabisa",
   "answerWas": "Jibu ni {{answer}}.",
   "timeUp": "Muda umeisha",
   "method": "MBINU",
   "next": "Ifuatayo",
   "review": "Dawati la mchanganuzi",
   "kinds": {
    "saveWeeks": {
     "name": "Kuweka akiba",
     "q": "Unaweka akiba {{weekly}} kwa wiki kwa ajili ya vipokea sauti vinavyobebeka vinavyogharimu {{target}}. Ni wiki ngapi hadi uweze kuvinunua?",
     "how": "Wiki = bei ÷ akiba ya wiki, ikikamilishwa juu: wiki isiyokamilika bado inamaanisha kusubiri wiki nyingine."
    },
    "shareOf": {
     "name": "Sehemu ya malipo",
     "q": "Malipo yako yanayobaki ni {{income}} kwa mwezi. {{share}} yake ni kiasi gani?",
     "how": "Kiasi = malipo × asilimia ÷ 100. Kanuni ya 50/30/20: 50% mahitaji, 30% matamanio, 20% akiba."
    },
    "simpleInterest": {
     "name": "Riba rahisi",
     "q": "Unakopa {{principal}} kwa riba rahisi ya {{rate}} kwa mwaka kwa miaka {{years}}. Unalipa riba jumla ya kiasi gani?",
     "how": "Riba rahisi = mtaji × kiwango × miaka. Riba hutozwa tu kwa kiasi kilichokopwa mwanzoni."
    },
    "cardInterest": {
     "name": "Riba ya kadi",
     "q": "Salio la kadi yako ya mkopo ni {{balance}} na kadi inatoza riba ya {{rate}} kwa mwezi. Usipolipa chochote, ni riba kiasi gani itaongezwa mwezi huu?",
     "how": "Riba ya mwezi = salio × kiwango cha mwezi. Bila kulipwa, inaongezwa kwenye salio na nayo inapata riba."
    },
    "compound": {
     "name": "Ukuaji wa mchanganyiko",
     "q": "Unawekeza {{principal}} kwa {{rate}} kwa mwaka, ikichanganywa mara moja kwa mwaka, kwa miaka {{years}}. Thamani yake mwishoni ni ngapi (kwa dola iliyo karibu zaidi)?",
     "how": "Thamani = mtaji × (1 + kiwango)^miaka. Riba ya kila mwaka huzalisha riba miaka inayofuata."
    },
    "realRate": {
     "name": "Faida halisi",
     "q": "Akiba yako inapata {{nominal}} kwa mwaka wakati bei zinapanda {{inflation}} kwa mwaka. Faida yako halisi ni ngapi (kwa desimali moja)?",
     "how": "Faida halisi = (1 + kiwango cha jina) ÷ (1 + mfumuko wa bei) − 1. Kutoa mfumuko wa bei kutoka kiwango cha jina ni makadirio tu."
    },
    "ear": {
     "name": "Kiwango cha mwaka kinachofaa",
     "q": "Kadi inatoza riba ya {{monthly}} kwa mwezi, ikichanganywa kila mwezi. Kiwango cha mwaka kinachofaa ni kipi (kwa desimali moja)?",
     "how": "Kiwango cha mwaka kinachofaa = (1 + kiwango cha mwezi)^12 − 1. Ni kikubwa kuliko 12 × kiwango cha mwezi kwa sababu riba inachanganywa."
    },
    "loanPayment": {
     "name": "Malipo ya mkopo",
     "q": "Unakopa {{principal}} kwa {{rate}} kwa mwaka, ukilipwa kwa malipo sawa ya kila mwezi kwa miaka {{years}} (riba inatozwa kila mwezi). Malipo ya mwezi ni kiasi gani?",
     "how": "Malipo = P × i ÷ (1 − (1 + i)^−n), ambapo i = kiwango cha mwaka ÷ 12 na n = idadi ya miezi."
    },
    "taxBands": {
     "name": "Viwango vya kodi",
     "q": "Kipato: {{income}}. Kodi ni 0% kwa {{band1}} ya kwanza, {{rate2}} kwa kipato kutoka {{band1}} hadi {{band2}}, na {{rate3}} kwa kila kitu juu ya {{band2}}. Kodi inayostahili kwa jumla ni kiasi gani?",
     "how": "Toza kodi kwa kila kipande cha kipato kwa kiwango chake na ujumlishe vipande. Kiwango cha juu hakikodi kipato kilicho chini yake."
    },
    "retirement": {
     "name": "Kuweka akiba kwa uzeeni",
     "q": "Unaweka akiba {{payment}} mwishoni mwa kila mwaka kwa miaka {{years}} kwa {{rate}} kwa mwaka. Mfuko una thamani gani baada ya malipo ya mwisho (kwa dola iliyo karibu zaidi)?",
     "how": "Thamani ya baadaye ya annuity = malipo × ((1 + kiwango)^miaka − 1) ÷ kiwango."
    },
    "revenue": {
     "name": "Mapato",
     "q": "Unauza vikombe {{qty}} kwa {{price}} kila kimoja. Kila kikombe kinakugharimu {{cost}} kutengeneza. Mapato yako ni kiasi gani?",
     "how": "Mapato = idadi iliyouzwa × bei. Mapato ni kabla ya gharama zozote; faida ni kinachobaki baada ya gharama."
    },
    "profitDay": {
     "name": "Faida ya siku",
     "q": "Unanunua vitu {{bought}} kwa {{cost}} kila kimoja na kulipa ada ya kibanda {{fee}}. Unauza {{qty}} kati yao kwa {{price}} kila kimoja, na vingine vinapotea. Faida yako ni kiasi gani?",
     "how": "Faida = mauzo × bei − kila kitu ulichonunua × gharama yake − ada zisizobadilika. Bidhaa isiyouzwa bado ni gharama."
    },
    "demandAt": {
     "name": "Kusoma mahitaji",
     "q": "Kwa {{p1}} unapata wateja {{q1}}; kwa {{p2}} unapata {{q2}}. Mahitaji hupungua kwa mstari ulionyooka. Utapata wateja wangapi kwa {{p3}}?",
     "how": "Mstari ulionyooka hupoteza idadi sawa ya wateja kwa kila dola ya ziada: tafuta mteremko huo, kisha uendelee."
    },
    "elasticity": {
     "name": "Unabainifu wa bei",
     "q": "Bei inapopanda kutoka {{p1}} hadi {{p2}}, mauzo hupungua kutoka {{q1}} hadi {{q2}}. Kwa kutumia mbinu ya katikati, unabainifu wa bei wa mahitaji ni upi (kama namba chanya, kwa desimali mbili)?",
     "how": "Unabainifu = (mabadiliko ya Q ÷ wastani wa Q) ÷ (mabadiliko ya P ÷ wastani wa P). Zaidi ya 1 ni unabainifu; chini ya 1 si unabainifu."
    },
    "bestPrice": {
     "name": "Bei bora",
     "q": "Wateja kwa siku = {{a}} − {{b}} × bei, na kila bidhaa inakugharimu {{cost}}. Bei ipi inaleta faida kubwa zaidi?",
     "how": "Kwa mahitaji ya mstari ulionyooka, bei inayolipa zaidi ni katikati ya gharama na bei ambayo hakuna anayenunua: (a ÷ b + cost) ÷ 2."
    },
    "monopolyQ": {
     "name": "Uzalishaji wa ukiritimba",
     "q": "Ukiritimba unakabiliana na mzingo wa mahitaji P = {{A}} − {{B}}Q na una gharama ya pembeni isiyobadilika ya {{mc}}. Kiasi gani kinaongeza faida yake (kwa desimali moja)?",
     "how": "Weka mapato ya pembeni sawa na gharama ya pembeni: MR = A − 2BQ, kwa hiyo Q = (A − MC) ÷ 2B."
    },
    "hhi": {
     "name": "Mkusanyiko wa soko",
     "q": "Kampuni {{firms}} katika soko zina hisa za {{shares}}. Herfindahl–Hirschman Index (HHI) ni ipi?",
     "how": "HHI = jumla ya mraba wa hisa ya soko ya kila kampuni (kwa %). Zaidi ya 2,500 kwa kawaida huchukuliwa kuwa mkusanyiko mkubwa sana."
    },
    "cournot": {
     "name": "Duopoli (Cournot)",
     "q": "Kampuni mbili zinazofanana zinashindana kwa kiasi. Mahitaji ya soko ni P = {{A}} − {{B}}(q₁ + q₂) na kila moja ina gharama ya pembeni isiyobadilika ya {{mc}}. Katika usawa wa Cournot, kila kampuni inazalisha kiasi gani (kwa desimali moja)?",
     "how": "Jibu bora la kila kampuni ni q = (A − MC − Bq_other) ÷ 2B; kwa kampuni zinazofanana, q = (A − MC) ÷ 3B."
    },
    "deadweight": {
     "name": "Hasara ya uzito wa kufa",
     "q": "Monopoli inakabiliana na P = {{A}} − {{B}}Q na gharama ya kando isiyobadilika ya {{mc}}. Ikilinganishwa na ushindani kamili, hasara ya uzito wa kufa ni ipi (kwa dola iliyo karibu zaidi)?",
     "how": "Monopoli hutoa Q = (A − MC) ÷ 2B, nusu ya Q ya ushindani = (A − MC) ÷ B. Pembetatu iliyopotea ni (A − MC)² ÷ 8B."
    },
    "operatingLeverage": {
     "name": "Kiwango cha uendeshaji",
     "q": "Unauza vipande {{units}} kwa {{price}}; kila kimoja hugharimu {{unit}} kukitengeneza, na gharama zisizobadilika ni {{fixed}}. Kiwango cha operating leverage ni kipi (hadi desimali mbili)?",
     "how": "DOL = mchango jumla ÷ faida ya uendeshaji. DOL ya 3 inamaanisha mabadiliko ya 1% kwenye mauzo husogeza faida kwa takriban 3%."
    },
    "npv": {
     "name": "Thamani halisi ya sasa",
     "q": "Mashine inagharimu {{cost}} leo na huleta {{cash}} mwishoni mwa kila mwaka kwa miaka {{years}}. Kwa kiwango cha punguzo cha {{rate}}, NPV yake ni ipi (kwa dola iliyo karibu zaidi)?",
     "how": "NPV = pesa × (1 − (1 + r)^−miaka) ÷ r − gharama. Wekeza wakati NPV ni chanya."
    },
    "wacc": {
     "name": "Gharama ya mtaji",
     "q": "Kampuni ina {{equity}} ya hisa zinazogharimu {{re}} na {{debt}} ya deni linalogharimu {{rd}} kabla ya kodi. Kiwango cha kodi ni {{tax}}. WACC yake ni ipi (kwa desimali mbili)?",
     "how": "WACC = E ÷ V × gharama ya mtaji wa hisa + D ÷ V × gharama ya deni × (1 − kodi), ambapo V = E + D. Riba inakatwa kodi."
    },
    "projectNpv": {
     "name": "Tathmini ya mradi",
     "q": "Kampuni yenye {{equity}} ya hisa (gharama {{re}}) na {{debt}} ya deni (gharama {{rd}} kabla ya kodi, kiwango cha kodi {{tax}}) inazingatia mradi unaogharimu {{cost}} unaorejesha {{cash}} mwishoni mwa kila mwaka kwa miaka {{years}}. Ukipunguzwa kwa WACC ya kampuni, NPV ya mradi ni ipi (kwa dola iliyo karibu zaidi)?",
     "how": "Kwanza WACC = E ÷ V × re + D ÷ V × rd × (1 − tax); kisha NPV = cash × (1 − (1 + WACC)^−years) ÷ WACC − cost."
    },
    "dividendYield": {
     "name": "Mavuno ya gawio",
     "q": "Hisa inagharimu {{price}} na hulipa gawio la {{dividend}} kwa mwaka. Mavuno yake ya gawio ni yapi (kwa desimali moja)?",
     "how": "Mavuno ya gawio = gawio la mwaka ÷ bei ya hisa × 100."
    },
    "portfolioReturn": {
     "name": "Mapato ya jalada",
     "q": "Una {{w1}} ya pesa yako kwenye mfuko uliorejesha {{r1}} na {{w2}} kwenye mwingine uliorejesha {{r2}}. Jalada lako lote lilirejesha kiasi gani?",
     "how": "Faida ya kwingineko = uzito wa kila hisa × faida yake, zikijumlishwa."
    },
    "peValue": {
     "name": "Bei kutoka P/E",
     "q": "Kampuni hupata {{eps}} kwa hisa. Kampuni zinazofanana hufanya biashara kwa uwiano wa bei/mapato wa {{pe}}. Hiyo inapendekeza bei gani ya hisa?",
     "how": "Bei = mapato kwa hisa × uwiano wa P/E."
    },
    "capm": {
     "name": "CAPM",
     "q": "Kiwango kisicho na hatari ni {{rf}}, soko linatarajiwa kurejesha {{rm}}, na hisa ina beta ya {{beta}}. Kwa CAPM, wawekezaji wanapaswa kutarajia mapato gani (kwa desimali moja)?",
     "how": "Mapato yanayotarajiwa = kiwango kisicho na hatari + beta × (mapato ya soko − kiwango kisicho na hatari)."
    },
    "sharpe": {
     "name": "Uwiano wa Sharpe",
     "q": "Mfuko ulirejesha {{rp}} ukiwa na mkengeuko wa kawaida wa {{sd}}; kiwango kisicho na hatari kilikuwa {{rf}}. Uwiano wake wa Sharpe ni upi (kwa desimali mbili)?",
     "how": "Uwiano wa Sharpe = (mapato − kiwango kisicho na hatari) ÷ mkengeuko wa kawaida: mapato ya ziada kwa kila kitengo cha hatari."
    },
    "gordon": {
     "name": "Mfano wa punguzo la gawio",
     "q": "Hisa imelipa gawio la {{d0}} hivi punde. Magawio hukua {{g}} kwa mwaka milele na wawekezaji wanahitaji {{r}}. Hisa ina thamani gani (mfano wa ukuaji wa Gordon)?",
     "how": "Thamani = gawio la mwaka ujao ÷ (mapato yanayohitajika − ukuaji) = D₀ × (1 + g) ÷ (r − g)."
    },
    "bondPrice": {
     "name": "Bei ya bondi",
     "q": "Bondi yenye thamani ya uso {{face}} hulipa kuponi ya {{coupon}} mara moja kwa mwaka na inakomaa baada ya miaka {{years}}. Ikiwa mavuno ya soko ni {{y}}, bei yake ni ipi?",
     "how": "Bei = kuponi zilizopunguzwa kama annuity + thamani ya uso ÷ (1 + mavuno)^miaka. Bei hupungua mavuno yanapopanda."
    },
    "twoAssetSd": {
     "name": "Hatari ya jalada",
     "q": "Unaweka {{w1}} kwenye mali A (mkengeuko wa kawaida {{s1}}) na {{w2}} kwenye mali B (mkengeuko wa kawaida {{s2}}). Uhusiano wao ni {{rho}}. Mkengeuko wa kawaida wa jalada ni upi (kwa desimali moja)?",
     "how": "σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). Chini ya uhusiano wa 1, kuchanganya mali hupunguza hatari: mseto."
    },
    "grossMargin": {
     "name": "Faida ghafi",
     "q": "Unauza bidhaa kwa {{price}}. Inagharimu {{unit}} kutengeneza na kuwasilisha. Faida yako ghafi ni ipi (kwa desimali moja)?",
     "how": "Faida ghafi = (bei − gharama ya mauzo) ÷ bei × 100."
    },
    "runway": {
     "name": "Muda wa kudumu",
     "q": "Startup ina {{cash}} benki. Inaingiza {{revenue}} kwa mwezi na hutumia {{costs}} kwa mwezi. Inaweza kuendelea kwa miezi mingapi kamili?",
     "how": "Runway = pesa ÷ matumizi ya kila mwezi, ambapo matumizi = gharama − mapato. Punguza chini: sehemu ya mwezi wa mwisho haijafunikwa."
    },
    "ltvCac": {
     "name": "LTV : CAC",
     "q": "Mteja hulipa {{monthly}} kwa mwezi kwa gross margin ya {{gm}} na hubaki miezi {{months}} kwa wastani. Kumpata kila mteja hugharimu {{cac}}. Uwiano wa LTV kwa CAC ni upi (hadi desimali moja)?",
     "how": "LTV = malipo ya mwezi × gross margin × miezi; uwiano = LTV ÷ CAC. Wawekezaji hupenda kuona 3× au zaidi."
    },
    "dilution": {
     "name": "Upunguzaji hisa",
     "q": "Unamiliki {{own}} ya startup yako. Mwekezaji anaweka {{invest}} kwa thamani ya kabla ya uwekezaji ya {{pre}}. Unamiliki kiasi gani baada ya mzunguko (hadi nukta moja ya desimali)?",
     "how": "Hisa mpya = hisa ya awali × kabla ya uwekezaji ÷ baada ya uwekezaji, ambapo baada ya uwekezaji = kabla ya uwekezaji + uwekezaji."
    },
    "evMultiple": {
     "name": "Thamani kwa kizidishi",
     "q": "Kampuni ina EBITDA ya {{ebitda}}. Kampuni zinazofanana zinauzwa kwa {{multiple}}× EBITDA. Ina deni la {{debt}} na fedha taslimu {{cash}}. Thamani ya hisa zake ni ipi?",
     "how": "Thamani ya biashara = EBITDA × kizidishi. Thamani ya hisa = thamani ya biashara − deni + fedha taslimu."
    },
    "dcfPerpetuity": {
     "name": "DCF na ukuaji",
     "q": "Mwaka ujao kampuni itazalisha mtiririko huru wa fedha wa {{fcf}}, ukikua {{g}} kwa mwaka milele. Gharama ya mtaji wake ni {{r}}. Thamani ya biashara yake ni ipi?",
     "how": "Thamani = mtiririko huru wa fedha wa mwaka ujao ÷ (gharama ya mtaji − ukuaji)."
    },
    "convertible": {
     "name": "Hati ya kubadilika",
     "q": "Hati ya kubadilika ya {{note}} inabadilika kwa punguzo la {{discount}} kutoka bei ya mzunguko ujao ya {{price}} kwa hisa. Mwekezaji anapata hisa ngapi (hadi hisa iliyo karibu)?",
     "how": "Bei ya ubadilishaji = bei ya mzunguko × (1 − punguzo); hisa = hati ÷ bei ya ubadilishaji."
    },
    "twoStageDcf": {
     "name": "DCF ya hatua mbili",
     "q": "Mtiririko huru wa fedha ni {{fcf}} mwaka huu. Utakua {{g1}} kwa mwaka kwa miaka mitatu ijayo, kisha {{g2}} kwa mwaka milele. Gharama ya mtaji ni {{r}}. Thamani ya biashara leo ni ipi (hadi dola iliyo karibu)?",
     "how": "Punguza mtiririko wa fedha wa miaka 1–3, kisha ongeza thamani ya mwisho mwaka wa 3 = FCF₃ × (1 + g₂) ÷ (r − g₂), iliyopunguzwa miaka mitatu."
    }
   }
  },
  "charts": {
   "cash": "Fedha taslimu",
   "value": "Thamani ya kampuni",
   "goal": "Lengo",
   "month": "Mwezi {{n}}",
   "quarter": "Robo {{n}}",
   "day": "Siku {{n}}",
   "week": "Wiki {{n}}",
   "portfolio": "Jalada lako",
   "index": "Mfuko wa fahirisi",
   "revenue": "Mapato",
   "costs": "Gharama zote",
   "profit": "Faida",
   "customers": "Wateja",
   "price": "Bei",
   "units": "Vipande",
   "breakEven": "Kivunja-sawa",
   "demand": "Mahitaji",
   "yourPrice": "Bei yako",
   "allocation": "Mgawanyo",
   "needs": "Mahitaji ya lazima",
   "wants": "Mahitaji ya hiari",
   "savings": "Akiba",
   "chartA11y": "{{title}}: {{summary}}"
  }
 },
 "pt": {
  "games": {
   "startup-tycoon": {
    "tagline": "Gere uma empresa mês a mês e depois avalie-a como um analista.",
    "rules": {
     "r1": "Todos os meses, escolhe a tua equipa, o teu marketing e uma resposta a um dilema de gestão. O servidor corre o mês e envia os teus lucros e perdas.",
     "r2": "Aumenta o valor da empresa até ao objetivo sem ficares sem dinheiro. Uma má decisão ou a falência custa um coração.",
     "r3": "A partir de Iniciante, a mesa do analista no final pergunta sobre os teus números: margens, runway e, no topo, diluição e avaliação por DCF.",
     "example": "Receita $9,000 − custo das vendas $3,000 = lucro bruto $6,000; após $5,200 de salários e renda, o mês deu $800."
    }
   },
   "budget-master": {
    "tagline": "Planeia cada dólar, da mesada ao pagamento de dívidas.",
    "rules": {
     "r1": "Todos os meses, paga as contas e depois distribui o resto: comida, diversão, roupa, um fundo de emergência, uma meta de poupança e pagamentos extra de dívida. Cada dólar tem de ter uma função.",
     "r2": "Depois acontece algo: escolhe como lidar. Saltar refeições ou uma má escolha custa um coração.",
     "r3": "Níveis mais altos trazem renda, dívida de cartão com juros e salário irregular; a mesa do analista pergunta sobre juros, empréstimos, impostos e poupança para a reforma.",
     "example": "$400 de mesada: $60 de contas, $80 para comida, $40 para diversão, $220 poupados (55%)."
    }
   },
   "market-master": {
    "tagline": "Define o preço de uma barraca e depois lê os mercados como um economista.",
    "rules": {
     "r1": "Todos os dias, define o teu preço e quanto stock comprar. O tempo, as multidões e um rival alteram quantos clientes vêm.",
     "r2": "O stock não vendido desperdiça-se e um prejuízo custa um coração. Quanto mais perto do melhor lucro, mais pontos.",
     "r3": "A pesquisa de mercado desaparece a partir de Intermédio-alto; a mesa do analista vai da receita à elasticidade, monopólio, concentração e concorrência de Cournot.",
     "example": "60 copos vendidos a $1.50 são $90 de receita; com 70 copos comprados a $0.50 e uma taxa de $10, o lucro é $45."
    }
   },
   "profit-quest": {
    "tagline": "Domina a matemática do lucro e depois gere uma fábrica semana a semana.",
    "rules": {
     "r1": "Matemática empresarial e semanas de fábrica alternam. Calcula cada soma e depois escolhe uma resposta.",
     "r2": "Numa semana de fábrica, define o preço e quantas unidades produzir; as sobras custam armazenamento. Um prejuízo custa um coração.",
     "r3": "As somas sobem da margem de contribuição e do ponto crítico à alavancagem operacional, NPV e custo do capital, com um relógio mais curto.",
     "example": "Preço $40, custo de produção $25: cada venda contribui com $15. Custos fixos de $1,500 precisam de 100 vendas para o ponto crítico."
    }
   },
   "market-simulator": {
    "tagline": "Investe dinheiro de treino e aprende risco, retorno e avaliação.",
    "rules": {
     "r1": "Todos os trimestres, lê as notícias e divide o teu dinheiro entre dinheiro, obrigações, um fundo de índice e empresas fictícias (tem de somar 100%).",
     "r2": "Responde à pergunta de investimento do trimestre. Bater o índice e diversificar o risco dão pontos; uma resposta errada custa um coração.",
     "r3": "Taxas e limites numa empresa chegam a Intermédio-alto; a mesa do analista vai até CAPM, preços de obrigações e risco de carteira.",
     "example": "60% num fundo de índice que subiu 5% e 40% em obrigações que subiram 1%: a carteira subiu 3.4%."
    }
   }
  },
  "analyst": {
   "eyebrow": "MESA DO ANALISTA",
   "step": "Pergunta {{n}} de {{total}}",
   "intro": "Resolve no papel ou com calculadora e depois escolhe.",
   "check": "Verificar resposta",
   "right": "Correto",
   "wrong": "Quase",
   "answerWas": "A resposta é {{answer}}.",
   "timeUp": "Tempo esgotado",
   "method": "MÉTODO",
   "next": "Seguinte",
   "review": "Mesa do analista",
   "kinds": {
    "saveWeeks": {
     "name": "Poupar para comprar",
     "q": "Poupas {{weekly}} por semana para uns auscultadores que custam {{target}}. Quantas semanas até os poderes comprar?",
     "how": "Semanas = preço ÷ poupança semanal, arredondado para cima: uma fração de semana ainda significa esperar mais uma semana."
    },
    "shareOf": {
     "name": "Parte do salário",
     "q": "O teu salário líquido é {{income}} por mês. Quanto é {{share}} disso?",
     "how": "Montante = salário × percentagem ÷ 100. A regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança."
    },
    "simpleInterest": {
     "name": "Juro simples",
     "q": "Pediste emprestado {{principal}} a juros simples de {{rate}} ao ano durante {{years}} anos. Quanto pagas de juros no total?",
     "how": "Juro simples = capital × taxa × anos. O juro incide sempre apenas sobre o montante inicialmente emprestado."
    },
    "cardInterest": {
     "name": "Juros do cartão",
     "q": "O saldo do teu cartão de crédito é {{balance}} e o cartão cobra {{rate}} de juros por mês. Se não pagares nada, quantos juros são acrescentados este mês?",
     "how": "Juros mensais = saldo × taxa mensal. Se não forem pagos, são somados ao saldo e também geram juros."
    },
    "compound": {
     "name": "Crescimento composto",
     "q": "Investes {{principal}} a {{rate}} ao ano, com capitalização anual, durante {{years}} anos. Quanto vale no final (arredondado ao dólar)?",
     "how": "Valor = principal × (1 + taxa)^anos. Os juros de cada ano geram juros nos anos seguintes."
    },
    "realRate": {
     "name": "Retorno real",
     "q": "As tuas poupanças rendem {{nominal}} ao ano enquanto os preços sobem {{inflation}} ao ano. Qual é o teu retorno real (com uma casa decimal)?",
     "how": "Retorno real = (1 + taxa nominal) ÷ (1 + inflação) − 1. Nominal menos inflação é apenas uma aproximação."
    },
    "ear": {
     "name": "Taxa anual efetiva",
     "q": "Um cartão cobra {{monthly}} de juros por mês, com capitalização mensal. Qual é a taxa anual efetiva (com uma casa decimal)?",
     "how": "Taxa anual efetiva = (1 + taxa mensal)^12 − 1. É superior a 12 × a taxa mensal porque os juros capitalizam."
    },
    "loanPayment": {
     "name": "Pagamento de empréstimo",
     "q": "Pedes emprestado {{principal}} a {{rate}} ao ano, a reembolsar em prestações mensais iguais durante {{years}} anos (juros cobrados mensalmente). Qual é a prestação mensal?",
     "how": "Prestação = P × i ÷ (1 − (1 + i)^−n), com i = taxa anual ÷ 12 e n = número de meses."
    },
    "taxBands": {
     "name": "Escalões de imposto",
     "q": "Rendimento: {{income}}. O imposto é 0% sobre os primeiros {{band1}}, {{rate2}} sobre o rendimento de {{band1}} a {{band2}}, e {{rate3}} sobre tudo acima de {{band2}}. Quanto imposto é devido no total?",
     "how": "Tributa cada fração do rendimento à sua própria taxa e soma as frações. Um escalão superior nunca tributa o rendimento abaixo dele."
    },
    "retirement": {
     "name": "Poupar para a reforma",
     "q": "Poupas {{payment}} no final de cada ano durante {{years}} anos a {{rate}} ao ano. Quanto vale o fundo após o último pagamento (arredondado ao dólar)?",
     "how": "Valor futuro de uma anuidade = pagamento × ((1 + taxa)^anos − 1) ÷ taxa."
    },
    "revenue": {
     "name": "Receita",
     "q": "Vendes {{qty}} copos a {{price}} cada. Cada copo custa-te {{cost}} a produzir. Qual é a tua receita?",
     "how": "Receita = quantidade vendida × preço. A receita é antes de quaisquer custos; o lucro é o que sobra depois deles."
    },
    "profitDay": {
     "name": "Lucro de um dia",
     "q": "Compras {{bought}} artigos a {{cost}} cada e pagas {{fee}} de taxa de banca. Vendes {{qty}} deles a {{price}} cada, e o resto perde-se. Qual é o teu lucro?",
     "how": "Lucro = vendas × preço − tudo o que compraste × o seu custo − taxas fixas. O stock não vendido continua a ser um custo."
    },
    "demandAt": {
     "name": "Ler a procura",
     "q": "A {{p1}} tens {{q1}} clientes; a {{p2}} tens {{q2}}. A procura cai em linha reta. Quantos clientes terias a {{p3}}?",
     "how": "Uma linha reta perde o mesmo número de clientes por cada dólar extra: encontra esse declive e continua-o."
    },
    "elasticity": {
     "name": "Elasticidade-preço",
     "q": "Quando o preço sobe de {{p1}} para {{p2}}, as vendas caem de {{q1}} para {{q2}}. Usando o método do ponto médio, qual é a elasticidade-preço da procura (como número positivo, com duas casas decimais)?",
     "how": "Elasticidade = (variação de Q ÷ Q médio) ÷ (variação de P ÷ P médio). Acima de 1 é elástica; abaixo de 1 é inelástica."
    },
    "bestPrice": {
     "name": "O melhor preço",
     "q": "Clientes por dia = {{a}} − {{b}} × preço, e cada artigo custa-te {{cost}}. Que preço dá o maior lucro?",
     "how": "Com procura em linha reta, o preço que maximiza o lucro está a meio caminho entre o custo e o preço a que ninguém compra: (a ÷ b + custo) ÷ 2."
    },
    "monopolyQ": {
     "name": "Produção em monopólio",
     "q": "Um monopólio enfrenta a curva da procura P = {{A}} − {{B}}Q e tem um custo marginal constante de {{mc}}. Que quantidade maximiza o seu lucro (com uma casa decimal)?",
     "how": "Iguala a receita marginal ao custo marginal: MR = A − 2BQ, logo Q = (A − MC) ÷ 2B."
    },
    "hhi": {
     "name": "Concentração do mercado",
     "q": "As {{firms}} empresas de um mercado têm quotas de {{shares}}. Qual é o índice Herfindahl–Hirschman (HHI)?",
     "how": "HHI = soma do quadrado da quota de mercado de cada empresa (em %). Acima de 2 500 é geralmente considerado altamente concentrado."
    },
    "cournot": {
     "name": "Duopólio (Cournot)",
     "q": "Duas empresas idênticas competem na quantidade. A procura de mercado é P = {{A}} − {{B}}(q₁ + q₂) e cada uma tem um custo marginal constante de {{mc}}. No equilíbrio de Cournot, quanto produz cada empresa (com uma casa decimal)?",
     "how": "A melhor resposta de cada empresa é q = (A − MC − Bq_outra) ÷ 2B; com empresas idênticas, q = (A − MC) ÷ 3B."
    },
    "deadweight": {
     "name": "Perda de peso morto",
     "q": "Um monopólio enfrenta P = {{A}} − {{B}}Q com um custo marginal constante de {{mc}}. Em comparação com a concorrência perfeita, qual é a perda de peso morto (arredondada ao dólar)?",
     "how": "O monopólio produz Q = (A − MC) ÷ 2B, metade do Q competitivo = (A − MC) ÷ B. O triângulo perdido é (A − MC)² ÷ 8B."
    },
    "operatingLeverage": {
     "name": "Alavancagem operacional",
     "q": "Vendes {{units}} unidades a {{price}}; cada uma custa {{unit}} a produzir, e os custos fixos são {{fixed}}. Qual é o grau de alavancagem operacional (com duas casas decimais)?",
     "how": "DOL = margem de contribuição total ÷ lucro operacional. Um DOL de 3 significa que uma variação de 1% nas vendas altera o lucro em cerca de 3%."
    },
    "npv": {
     "name": "Valor atual líquido",
     "q": "Uma máquina custa {{cost}} hoje e gera {{cash}} no final de cada ano durante {{years}} anos. A uma taxa de desconto de {{rate}}, qual é o seu NPV (arredondado ao dólar)?",
     "how": "NPV = cash × (1 − (1 + r)^−years) ÷ r − cost. Investe quando o NPV é positivo."
    },
    "wacc": {
     "name": "Custo do capital",
     "q": "Uma empresa tem {{equity}} de capital próprio com custo de {{re}} e {{debt}} de dívida com custo de {{rd}} antes de impostos. A taxa de imposto é {{tax}}. Qual é o seu WACC (com duas casas decimais)?",
     "how": "WACC = E ÷ V × custo do capital próprio + D ÷ V × custo da dívida × (1 − tax), onde V = E + D. Os juros são dedutíveis fiscalmente."
    },
    "projectNpv": {
     "name": "Avaliação de projetos",
     "q": "Uma empresa com {{equity}} de capital próprio (custo {{re}}) e {{debt}} de dívida (custo {{rd}} antes de impostos, taxa de imposto {{tax}}) considera um projeto que custa {{cost}} e gera {{cash}} no final de cada ano durante {{years}} anos. Descontado ao WACC da empresa, qual é o NPV do projeto (arredondado ao dólar)?",
     "how": "Primeiro o WACC = E ÷ V × re + D ÷ V × rd × (1 − tax); depois NPV = cash × (1 − (1 + WACC)^−years) ÷ WACC − cost."
    },
    "dividendYield": {
     "name": "Rendimento de dividendos",
     "q": "Uma ação custa {{price}} e paga um dividendo de {{dividend}} por ano. Qual é o seu rendimento de dividendos (com uma casa decimal)?",
     "how": "Rendimento de dividendos = dividendo anual ÷ preço da ação × 100."
    },
    "portfolioReturn": {
     "name": "Retorno da carteira",
     "q": "Tens {{w1}} do teu dinheiro num fundo que rendeu {{r1}} e {{w2}} num que rendeu {{r2}}. Qual foi o retorno da tua carteira total?",
     "how": "Retorno da carteira = peso de cada aplicação × o seu retorno, somados."
    },
    "peValue": {
     "name": "Preço a partir do P/E",
     "q": "Uma empresa ganha {{eps}} por ação. Empresas semelhantes transacionam a um rácio preço/lucro de {{pe}}. Que preço por ação sugere isso?",
     "how": "Preço = lucro por ação × rácio P/E."
    },
    "capm": {
     "name": "CAPM",
     "q": "A taxa sem risco é {{rf}}, espera-se que o mercado renda {{rm}}, e uma ação tem um beta de {{beta}}. Usando o CAPM, que retorno devem os investidores esperar (com uma casa decimal)?",
     "how": "Retorno esperado = taxa sem risco + beta × (retorno do mercado − taxa sem risco)."
    },
    "sharpe": {
     "name": "Rácio de Sharpe",
     "q": "Um fundo rendeu {{rp}} com um desvio padrão de {{sd}}; a taxa sem risco era {{rf}}. Qual é o seu rácio de Sharpe (com duas casas decimais)?",
     "how": "Rácio de Sharpe = (retorno − taxa sem risco) ÷ desvio padrão: o retorno extra obtido por cada unidade de risco."
    },
    "gordon": {
     "name": "Modelo de desconto de dividendos",
     "q": "Uma ação acabou de pagar um dividendo de {{d0}}. Os dividendos crescem {{g}} por ano para sempre e os investidores exigem {{r}}. Quanto vale a ação (modelo de crescimento de Gordon)?",
     "how": "Valor = dividendo do próximo ano ÷ (retorno exigido − crescimento) = D₀ × (1 + g) ÷ (r − g)."
    },
    "bondPrice": {
     "name": "Preço de obrigação",
     "q": "Uma obrigação com valor nominal de {{face}} paga um cupão de {{coupon}} uma vez por ano e vence em {{years}} anos. Se a yield de mercado for {{y}}, qual é o seu preço?",
     "how": "Preço = os cupões descontados como uma anuidade + o valor nominal ÷ (1 + yield)^anos. Os preços caem quando as yields sobem."
    },
    "twoAssetSd": {
     "name": "Risco da carteira",
     "q": "Colocas {{w1}} no ativo A (desvio padrão {{s1}}) e {{w2}} no ativo B (desvio padrão {{s2}}). A correlação entre eles é {{rho}}. Qual é o desvio padrão da carteira (com uma casa decimal)?",
     "how": "σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). Com correlação inferior a 1, misturar ativos reduz o risco: diversificação."
    },
    "grossMargin": {
     "name": "Margem bruta",
     "q": "Vendes um produto por {{price}}. Custa {{unit}} produzi-lo e entregá-lo. Qual é a tua margem bruta (com uma casa decimal)?",
     "how": "Margem bruta = (preço − custo da venda) ÷ preço × 100."
    },
    "runway": {
     "name": "Autonomia financeira",
     "q": "Uma startup tem {{cash}} no banco. Recebe {{revenue}} por mês e gasta {{costs}} por mês. Durante quantos meses inteiros consegue continuar?",
     "how": "Runway = caixa ÷ burn mensal, em que burn = custos − receita. Arredonda para baixo: o último mês parcial não está coberto."
    },
    "ltvCac": {
     "name": "LTV : CAC",
     "q": "Um cliente paga {{monthly}} por mês com uma margem bruta de {{gm}} e fica {{months}} meses em média. Conquistar cada cliente custa {{cac}}. Qual é o rácio LTV/CAC (com uma casa decimal)?",
     "how": "LTV = pagamento mensal × margem bruta × meses; rácio = LTV ÷ CAC. Os investidores gostam de ver 3× ou mais."
    },
    "dilution": {
     "name": "Diluição",
     "q": "Detens {{own}} da tua startup. Um investidor entra com {{invest}} a uma valorização pre-money de {{pre}}. Quanto detens após a ronda (com uma casa decimal)?",
     "how": "Nova participação = participação antiga × pre-money ÷ post-money, em que post-money = pre-money + investimento."
    },
    "evMultiple": {
     "name": "Avaliação por múltiplo",
     "q": "Uma empresa tem um EBITDA de {{ebitda}}. Empresas semelhantes vendem-se a {{multiple}}× EBITDA. Tem {{debt}} de dívida e {{cash}} de caixa. Qual é o valor dos capitais próprios?",
     "how": "Valor da empresa = EBITDA × múltiplo. Valor dos capitais próprios = valor da empresa − dívida + caixa."
    },
    "dcfPerpetuity": {
     "name": "DCF com crescimento",
     "q": "No próximo ano, uma empresa gerará free cash flow de {{fcf}}, crescendo {{g}} por ano para sempre. O seu custo de capital é {{r}}. Qual é o seu enterprise value?",
     "how": "Valor = free cash flow do próximo ano ÷ (custo de capital − crescimento)."
    },
    "convertible": {
     "name": "Nota convertível",
     "q": "Uma nota convertível de {{note}} converte com um desconto de {{discount}} face ao preço da próxima ronda de {{price}} por ação. Quantas ações recebe o investidor (para a ação mais próxima)?",
     "how": "Preço de conversão = preço da ronda × (1 − desconto); ações = nota ÷ preço de conversão."
    },
    "twoStageDcf": {
     "name": "DCF em dois estágios",
     "q": "O free cash flow é {{fcf}} este ano. Crescerá {{g1}} por ano nos próximos três anos e depois {{g2}} por ano para sempre. O custo de capital é {{r}}. Qual é o enterprise value hoje (ao dólar mais próximo)?",
     "how": "Desconta os cash flows dos anos 1–3 e depois adiciona o valor terminal no ano 3 = FCF₃ × (1 + g₂) ÷ (r − g₂), descontado três anos."
    }
   }
  },
  "charts": {
   "cash": "Caixa",
   "value": "Valor da empresa",
   "goal": "Objetivo",
   "month": "Mês {{n}}",
   "quarter": "T{{n}}",
   "day": "Dia {{n}}",
   "week": "Semana {{n}}",
   "portfolio": "A sua carteira",
   "index": "Fundo índice",
   "revenue": "Receita",
   "costs": "Custos totais",
   "profit": "Lucro",
   "customers": "Clientes",
   "price": "Preço",
   "units": "Unidades",
   "breakEven": "Ponto crítico",
   "demand": "Procura",
   "yourPrice": "O seu preço",
   "allocation": "Alocação",
   "needs": "Necessidades",
   "wants": "Desejos",
   "savings": "Poupança",
   "chartA11y": "{{title}}: {{summary}}"
  }
 },
 "es": {
  "games": {
   "startup-tycoon": {
    "tagline": "Dirige una empresa mes a mes y luego valórala como un analista.",
    "rules": {
     "r1": "Cada mes, elige tu equipo, tu marketing y una respuesta a un dilema de gestión. El servidor ejecuta el mes y te envía tu cuenta de resultados.",
     "r2": "Aumenta el valor de la empresa hasta el objetivo sin quedarte sin efectivo. Una mala decisión o la bancarrota cuestan un corazón.",
     "r3": "Desde Principiante, el escritorio del analista al final pregunta por tus cifras: márgenes, runway y, en los niveles altos, dilución y valoración por DCF.",
     "example": "Ingresos $9,000 − coste de ventas $3,000 = beneficio bruto $6,000; tras $5,200 de nóminas y alquiler, el mes ganó $800."
    }
   },
   "budget-master": {
    "tagline": "Planifica cada dólar, desde la paga hasta pagar deudas.",
    "rules": {
     "r1": "Cada mes, paga las facturas y reparte el resto: comida, ocio, ropa, un fondo de emergencia, un objetivo de ahorro y pagos extra de deuda. Cada dólar debe tener un destino.",
     "r2": "Entonces ocurre algo: elige cómo manejarlo. Saltarte la comida o una mala elección cuestan un corazón.",
     "r3": "Los niveles altos traen alquiler, deuda de tarjeta con intereses y pagos irregulares; el escritorio del analista pregunta por intereses, préstamos, impuestos y ahorro para la jubilación.",
     "example": "$400 de paga: $60 de facturas, $80 para comida, $40 para ocio, $220 ahorrados (55%)."
    }
   },
   "market-master": {
    "tagline": "Pon precio a un puesto de mercado y luego lee los mercados como un economista.",
    "rules": {
     "r1": "Cada día, fija tu precio y cuánto stock comprar. El tiempo, la afluencia y un rival cambian cuántos clientes vienen.",
     "r2": "El stock sin vender se desperdicia y una pérdida cuesta un corazón. Cuanto más cerca del mejor beneficio, más puntos.",
     "r3": "La investigación de mercado desaparece desde Intermedio alto; el escritorio del analista va de ingresos a elasticidad, monopolio, concentración y competencia de Cournot.",
     "example": "60 vasos vendidos a $1.50 son $90 de ingresos; con 70 vasos comprados a $0.50 y una tasa de $10, el beneficio es $45."
    }
   },
   "profit-quest": {
    "tagline": "Domina las matemáticas del beneficio y luego dirige una fábrica semana a semana.",
    "rules": {
     "r1": "Las matemáticas de negocio y las semanas de fábrica se alternan. Resuelve cada suma y elige una respuesta.",
     "r2": "En una semana de fábrica, fija el precio y cuántas producir; los sobrantes cuestan almacenamiento. Una pérdida cuesta un corazón.",
     "r3": "Las sumas suben desde contribución y punto de equilibrio hasta apalancamiento operativo, NPV y coste de capital, con un reloj más corto.",
     "example": "Precio $40, coste de producción $25: cada venta contribuye $15. Unos costes fijos de $1,500 necesitan 100 ventas para el punto de equilibrio."
    }
   },
   "market-simulator": {
    "tagline": "Invierte dinero de práctica y aprende riesgo, rentabilidad y valoración.",
    "rules": {
     "r1": "Cada trimestre, lee las noticias y reparte tu dinero entre efectivo, bonos, un fondo indexado y empresas inventadas (debe sumar 100%).",
     "r2": "Responde la pregunta de inversión del trimestre. Superar el índice y diversificar el riesgo dan puntos; una respuesta incorrecta cuesta un corazón.",
     "r3": "Las comisiones y los límites en una sola empresa llegan en Intermedio alto; el escritorio del analista llega hasta CAPM, precios de bonos y riesgo de cartera.",
     "example": "60% en un fondo indexado que subió 5% y 40% en bonos que subieron 1%: la cartera subió 3.4%."
    }
   }
  },
  "analyst": {
   "eyebrow": "ESCRITORIO DEL ANALISTA",
   "step": "Pregunta {{n}} de {{total}}",
   "intro": "Resuélvelo en papel o con calculadora y elige.",
   "check": "Comprobar respuesta",
   "right": "Correcto",
   "wrong": "Casi",
   "answerWas": "La respuesta es {{answer}}.",
   "timeUp": "Se acabó el tiempo",
   "method": "MÉTODO",
   "next": "Siguiente",
   "review": "Escritorio del analista",
   "kinds": {
    "saveWeeks": {
     "name": "Ahorrar",
     "q": "Ahorras {{weekly}} a la semana para unos auriculares que cuestan {{target}}. ¿Cuántas semanas hasta poder comprarlos?",
     "how": "Semanas = precio ÷ ahorro semanal, redondeando hacia arriba: una parte de semana aún significa esperar otra semana."
    },
    "shareOf": {
     "name": "Parte del sueldo",
     "q": "Tu sueldo neto es {{income}} al mes. ¿Cuánto es el {{share}} de eso?",
     "how": "Cantidad = sueldo × porcentaje ÷ 100. La regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro."
    },
    "simpleInterest": {
     "name": "Interés simple",
     "q": "Pides prestado {{principal}} a un interés simple del {{rate}} anual durante {{years}} años. ¿Cuánto interés pagas en total?",
     "how": "Interés simple = principal × tasa × años. El interés solo se cobra sobre la cantidad prestada inicialmente."
    },
    "cardInterest": {
     "name": "Interés de tarjeta",
     "q": "El saldo de tu tarjeta de crédito es {{balance}} y la tarjeta cobra {{rate}} de interés al mes. Si no pagas nada, ¿cuánto interés se añade este mes?",
     "how": "Interés mensual = saldo × tasa mensual. Si no se paga, se suma al saldo y también genera intereses."
    },
    "compound": {
     "name": "Crecimiento compuesto",
     "q": "Inviertes {{principal}} al {{rate}} anual, con capitalización anual, durante {{years}} años. ¿Cuánto vale al final (al dólar más cercano)?",
     "how": "Valor = principal × (1 + tasa)^años. Los intereses de cada año generan intereses los años siguientes."
    },
    "realRate": {
     "name": "Rentabilidad real",
     "q": "Tus ahorros rinden {{nominal}} al año mientras los precios suben {{inflation}} al año. ¿Cuál es tu rentabilidad real (con un decimal)?",
     "how": "Rentabilidad real = (1 + tasa nominal) ÷ (1 + inflación) − 1. Nominal menos inflación es solo una aproximación."
    },
    "ear": {
     "name": "Tasa anual efectiva",
     "q": "Una tarjeta cobra {{monthly}} de interés al mes, con capitalización mensual. ¿Cuál es la tasa anual efectiva (con un decimal)?",
     "how": "Tasa anual efectiva = (1 + tasa mensual)^12 − 1. Es mayor que 12 × la tasa mensual porque los intereses se capitalizan."
    },
    "loanPayment": {
     "name": "Pago de préstamo",
     "q": "Pides prestado {{principal}} al {{rate}} anual, a devolver en cuotas mensuales iguales durante {{years}} años (interés mensual). ¿Cuál es la cuota mensual?",
     "how": "Cuota = P × i ÷ (1 − (1 + i)^−n), con i = tasa anual ÷ 12 y n = número de meses."
    },
    "taxBands": {
     "name": "Tramos fiscales",
     "q": "Ingresos: {{income}}. El impuesto es del 0% sobre los primeros {{band1}}, del {{rate2}} sobre los ingresos de {{band1}} a {{band2}}, y del {{rate3}} sobre todo lo que supere {{band2}}. ¿Cuánto impuesto se debe en total?",
     "how": "Grava cada tramo de ingresos a su propia tasa y suma los tramos. Un tramo superior nunca grava los ingresos inferiores."
    },
    "retirement": {
     "name": "Ahorrar para la jubilación",
     "q": "Ahorras {{payment}} al final de cada año durante {{years}} años al {{rate}} anual. ¿Cuánto vale el fondo tras el último pago (al dólar más cercano)?",
     "how": "Valor futuro de una anualidad = pago × ((1 + tasa)^años − 1) ÷ tasa."
    },
    "revenue": {
     "name": "Ingresos",
     "q": "Vendes {{qty}} vasos a {{price}} cada uno. Cada vaso te cuesta {{cost}} hacerlo. ¿Cuáles son tus ingresos?",
     "how": "Ingresos = cantidad vendida × precio. Los ingresos son antes de cualquier coste; el beneficio es lo que queda después."
    },
    "profitDay": {
     "name": "Beneficio de un día",
     "q": "Compras {{bought}} artículos a {{cost}} cada uno y pagas {{fee}} de tasa por el puesto. Vendes {{qty}} de ellos a {{price}} cada uno y el resto se pierde. ¿Cuál es tu beneficio?",
     "how": "Beneficio = ventas × precio − todo lo comprado × su coste − tasas fijas. El stock no vendido sigue siendo un coste."
    },
    "demandAt": {
     "name": "Leer la demanda",
     "q": "A {{p1}} tienes {{q1}} clientes; a {{p2}} tienes {{q2}}. La demanda cae en línea recta. ¿Cuántos clientes tendrías a {{p3}}?",
     "how": "Una línea recta pierde el mismo número de clientes por cada dólar extra: halla esa pendiente y continúa."
    },
    "elasticity": {
     "name": "Elasticidad precio",
     "q": "Cuando el precio sube de {{p1}} a {{p2}}, las ventas caen de {{q1}} a {{q2}}. Con el método del punto medio, ¿cuál es la elasticidad precio de la demanda (como número positivo, con dos decimales)?",
     "how": "Elasticidad = (cambio en Q ÷ Q media) ÷ (cambio en P ÷ P medio). Por encima de 1 es elástica; por debajo de 1 es inelástica."
    },
    "bestPrice": {
     "name": "El mejor precio",
     "q": "Clientes al día = {{a}} − {{b}} × precio, y cada artículo te cuesta {{cost}}. ¿Qué precio da el mayor beneficio?",
     "how": "Con demanda lineal, el precio que maximiza el beneficio está a medio camino entre el coste y el precio al que nadie compra: (a ÷ b + coste) ÷ 2."
    },
    "monopolyQ": {
     "name": "Producción en monopolio",
     "q": "Un monopolio enfrenta la curva de demanda P = {{A}} − {{B}}Q y tiene un coste marginal constante de {{mc}}. ¿Qué cantidad maximiza su beneficio (con un decimal)?",
     "how": "Iguala el ingreso marginal al coste marginal: MR = A − 2BQ, así que Q = (A − MC) ÷ 2B."
    },
    "hhi": {
     "name": "Concentración de mercado",
     "q": "Las {{firms}} empresas de un mercado tienen cuotas de {{shares}}. ¿Cuál es el índice Herfindahl–Hirschman (HHI)?",
     "how": "HHI = la suma de la cuota de mercado al cuadrado de cada empresa (en %). Por encima de 2.500 suele considerarse muy concentrado."
    },
    "cournot": {
     "name": "Duopolio (Cournot)",
     "q": "Dos empresas idénticas compiten en cantidad. La demanda de mercado es P = {{A}} − {{B}}(q₁ + q₂) y cada una tiene un coste marginal constante de {{mc}}. En el equilibrio de Cournot, ¿cuánto produce cada empresa (con un decimal)?",
     "how": "La mejor respuesta de cada empresa es q = (A − MC − Bq_otra) ÷ 2B; con empresas idénticas, q = (A − MC) ÷ 3B."
    },
    "deadweight": {
     "name": "Pérdida de eficiencia",
     "q": "Un monopolio enfrenta P = {{A}} − {{B}}Q con un coste marginal constante de {{mc}}. Comparado con competencia perfecta, ¿cuál es la pérdida de eficiencia (al dólar más cercano)?",
     "how": "El monopolio produce Q = (A − MC) ÷ 2B, la mitad de la Q competitiva = (A − MC) ÷ B. El triángulo perdido es (A − MC)² ÷ 8B."
    },
    "operatingLeverage": {
     "name": "Apalancamiento operativo",
     "q": "Vendes {{units}} unidades a {{price}}; cada una cuesta {{unit}} producirla, y los costes fijos son {{fixed}}. ¿Cuál es el grado de apalancamiento operativo (a dos decimales)?",
     "how": "DOL = contribución total ÷ beneficio operativo. Un DOL de 3 significa que un cambio del 1% en ventas mueve el beneficio un 3% aprox."
    },
    "npv": {
     "name": "Valor actual neto",
     "q": "Una máquina cuesta {{cost}} hoy y aporta {{cash}} al final de cada año durante {{years}} años. Con una tasa de descuento del {{rate}}, ¿cuál es su NPV (al dólar más cercano)?",
     "how": "NPV = cash × (1 − (1 + r)^−years) ÷ r − cost. Invierte cuando el NPV es positivo."
    },
    "wacc": {
     "name": "Coste del capital",
     "q": "Una empresa tiene {{equity}} de capital propio con coste {{re}} y {{debt}} de deuda con coste {{rd}} antes de impuestos. El tipo impositivo es {{tax}}. ¿Cuál es su WACC (a dos decimales)?",
     "how": "WACC = E ÷ V × coste del capital + D ÷ V × coste de la deuda × (1 − tax), donde V = E + D. Los intereses son deducibles."
    },
    "projectNpv": {
     "name": "Evaluación de proyectos",
     "q": "Una empresa con {{equity}} de capital (coste {{re}}) y {{debt}} de deuda (coste {{rd}} antes de impuestos, tipo {{tax}}) considera un proyecto que cuesta {{cost}} y devuelve {{cash}} al final de cada año durante {{years}} años. Descontado al WACC de la empresa, ¿cuál es el NPV del proyecto (al dólar más cercano)?",
     "how": "Primero el WACC = E ÷ V × re + D ÷ V × rd × (1 − tax); luego NPV = cash × (1 − (1 + WACC)^−years) ÷ WACC − cost."
    },
    "dividendYield": {
     "name": "Rentabilidad por dividendo",
     "q": "Una acción cuesta {{price}} y paga un dividendo de {{dividend}} al año. ¿Cuál es su rentabilidad por dividendo (a un decimal)?",
     "how": "Rentabilidad por dividendo = dividendo anual ÷ precio de la acción × 100."
    },
    "portfolioReturn": {
     "name": "Rentabilidad de cartera",
     "q": "Tienes {{w1}} de tu dinero en un fondo que rindió {{r1}} y {{w2}} en otro que rindió {{r2}}. ¿Qué rindió tu cartera completa?",
     "how": "Rentabilidad de cartera = peso de cada posición × su rentabilidad, sumados."
    },
    "peValue": {
     "name": "Precio por P/E",
     "q": "Una empresa gana {{eps}} por acción. Empresas similares cotizan a una relación precio/beneficio de {{pe}}. ¿Qué precio por acción sugiere eso?",
     "how": "Precio = beneficio por acción × ratio P/E."
    },
    "capm": {
     "name": "CAPM",
     "q": "La tasa libre de riesgo es {{rf}}, se espera que el mercado rinda {{rm}}, y una acción tiene una beta de {{beta}}. Usando CAPM, ¿qué rentabilidad deberían esperar los inversores (a un decimal)?",
     "how": "Rentabilidad esperada = tasa libre de riesgo + beta × (rentabilidad del mercado − tasa libre de riesgo)."
    },
    "sharpe": {
     "name": "Ratio de Sharpe",
     "q": "Un fondo rindió {{rp}} con una desviación típica de {{sd}}; la tasa libre de riesgo era {{rf}}. ¿Cuál es su ratio de Sharpe (a dos decimales)?",
     "how": "Ratio de Sharpe = (rentabilidad − tasa libre de riesgo) ÷ desviación típica: la rentabilidad extra por cada unidad de riesgo."
    },
    "gordon": {
     "name": "Modelo de descuento de dividendos",
     "q": "Una acción acaba de pagar un dividendo de {{d0}}. Los dividendos crecen {{g}} al año indefinidamente y los inversores exigen {{r}}. ¿Cuánto vale la acción (modelo de crecimiento de Gordon)?",
     "how": "Valor = dividendo del próximo año ÷ (rentabilidad exigida − crecimiento) = D₀ × (1 + g) ÷ (r − g)."
    },
    "bondPrice": {
     "name": "Precio de un bono",
     "q": "Un bono con valor nominal {{face}} paga un cupón de {{coupon}} una vez al año y vence en {{years}} años. Si el rendimiento de mercado es {{y}}, ¿cuál es su precio?",
     "how": "Precio = los cupones descontados como anualidad + el valor nominal ÷ (1 + rendimiento)^años. Los precios bajan cuando suben los rendimientos."
    },
    "twoAssetSd": {
     "name": "Riesgo de cartera",
     "q": "Pones {{w1}} en el activo A (desviación típica {{s1}}) y {{w2}} en el activo B (desviación típica {{s2}}). Su correlación es {{rho}}. ¿Cuál es la desviación típica de la cartera (a un decimal)?",
     "how": "σ = √(w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂). Con correlación menor que 1, mezclar activos reduce el riesgo: diversificación."
    },
    "grossMargin": {
     "name": "Margen bruto",
     "q": "Vendes un producto por {{price}}. Cuesta {{unit}} producirlo y entregarlo. ¿Cuál es tu margen bruto (a un decimal)?",
     "how": "Margen bruto = (precio − coste de la venta) ÷ precio × 100."
    },
    "runway": {
     "name": "Autonomía financiera",
     "q": "Una startup tiene {{cash}} en el banco. Ingresa {{revenue}} al mes y gasta {{costs}} al mes. ¿Cuántos meses completos puede seguir adelante?",
     "how": "Autonomía = cash ÷ quema mensual, donde quema = costes − ingresos. Redondea hacia abajo: la última fracción de mes no está cubierta."
    },
    "ltvCac": {
     "name": "LTV : CAC",
     "q": "Un cliente paga {{monthly}} al mes con un margen bruto del {{gm}} y se queda {{months}} meses de media. Captar cada cliente cuesta {{cac}}. ¿Cuál es el ratio LTV/CAC (con un decimal)?",
     "how": "LTV = pago mensual × margen bruto × meses; ratio = LTV ÷ CAC. A los inversores les gusta ver 3× o más."
    },
    "dilution": {
     "name": "Dilución",
     "q": "Posees {{own}} de tu startup. Un inversor aporta {{invest}} con una valoración pre-money de {{pre}}. ¿Cuánto posees tras la ronda (con un decimal)?",
     "how": "Nueva participación = participación antigua × pre-money ÷ post-money, donde post-money = pre-money + inversión."
    },
    "evMultiple": {
     "name": "Valoración por múltiplo",
     "q": "Una empresa genera un EBITDA de {{ebitda}}. Empresas similares se venden a {{multiple}}× EBITDA. Tiene {{debt}} de deuda y {{cash}} de caja. ¿Cuánto vale su capital propio?",
     "how": "Valor de empresa = EBITDA × múltiplo. Valor del capital propio = valor de empresa − deuda + caja."
    },
    "dcfPerpetuity": {
     "name": "DCF con crecimiento",
     "q": "El año que viene una empresa generará un flujo de caja libre de {{fcf}}, que crecerá un {{g}} anual para siempre. Su coste de capital es {{r}}. ¿Cuál es su valor de empresa?",
     "how": "Valor = flujo de caja libre del próximo año ÷ (coste de capital − crecimiento)."
    },
    "convertible": {
     "name": "Pagaré convertible",
     "q": "Un pagaré convertible de {{note}} se convierte con un descuento del {{discount}} sobre el precio de {{price}} por acción de la siguiente ronda. ¿Cuántas acciones recibe el inversor (al número entero más cercano)?",
     "how": "Precio de conversión = precio de la ronda × (1 − descuento); acciones = pagaré ÷ precio de conversión."
    },
    "twoStageDcf": {
     "name": "DCF en dos etapas",
     "q": "El flujo de caja libre es {{fcf}} este año. Crecerá un {{g1}} anual durante los próximos tres años y luego un {{g2}} anual para siempre. El coste de capital es {{r}}. ¿Cuál es el valor de empresa hoy (al dólar más cercano)?",
     "how": "Descuenta los flujos de caja de los años 1–3 y luego suma el valor terminal en el año 3 = FCF₃ × (1 + g₂) ÷ (r − g₂), descontado tres años."
    }
   }
  },
  "charts": {
   "cash": "Caja",
   "value": "Valor de la empresa",
   "goal": "Objetivo",
   "month": "Mes {{n}}",
   "quarter": "T{{n}}",
   "day": "Día {{n}}",
   "week": "Semana {{n}}",
   "portfolio": "Tu cartera",
   "index": "Fondo índice",
   "revenue": "Ingresos",
   "costs": "Costes totales",
   "profit": "Beneficio",
   "customers": "Clientes",
   "price": "Precio",
   "units": "Unidades",
   "breakEven": "Punto de equilibrio",
   "demand": "Demanda",
   "yourPrice": "Tu precio",
   "allocation": "Distribución",
   "needs": "Necesidades",
   "wants": "Deseos",
   "savings": "Ahorros",
   "chartA11y": "{{title}}: {{summary}}"
  }
 }
} } as const;

let added = false;
/** Adds the words to i18next once (deep-merged into the namespace, so nothing else is replaced). */
export function addBusinessText() {
  if (added) return;
  added = true;
  for (const [lang, words] of Object.entries(BUSINESS_TEXT)) i18n.addResourceBundle(lang, 'business', words, true, false);
}
addBusinessText();
