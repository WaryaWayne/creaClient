import { routes } from "@/lib/routes"
import {} from "@/lib/with-base"

export interface FAQ {
  q: string
  a: string
}

export interface FAQCategory {
  id: string
  label: string
  faqs: FAQ[]
}

export interface FAQCategoryLink {
  label: string
  href: string
}

export const faqCategories: FAQCategory[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    faqs: [
      {
        q: "What is a Google Ads audit and why do I need one?",
        a: "A Google Ads audit is a deep-dive review of your entire ads account: keywords, match types, ad copy, bidding strategy, Quality Scores, negative keywords, and conversion tracking. Most business owners set up their campaigns once and never look back, which means they're spending inefficiently on irrelevant clicks every single day. An audit surfaces inefficient spend and gives you a concrete improvement plan with clear priorities.",
      },
      {
        q: "How do I know if my Google Ads are actually working?",
        a: "If you can't answer these three questions immediately, your ads probably aren't working: (1) What is my cost per lead? (2) Which keywords are generating phone calls vs. just clicks? (3) What search terms is Google actually showing my ads for? Most business owners can't answer any of these, which means they're working without reliable data. A properly set-up account has conversion tracking firing on every call and form submission so you always know your real numbers.",
      },
      {
        q: "Do I need to already have a Google Ads account to work with you?",
        a: "No. We work with both existing accounts and brand new setups. If you have an existing account, we audit it and rewrite what's underperforming. If you're starting from scratch, we build your full campaign structure from the ground up: keyword research, ad group architecture, conversion tracking, and copy. Either way, the process takes the same amount of time and costs the same flat rate.",
      },
      {
        q: "Can you set up a Google Ads campaign from scratch for me?",
        a: "Yes. Our Full Campaign Setup service covers everything from keyword research and ad group structure to conversion tracking and bidding strategy. We build it with a clean structure from day one: tight ad groups, relevant match types, negative keyword lists, and copy written to convert. Starting fresh is actually easier than improving an underperforming existing account; there's no legacy structure to untangle.",
      },
      {
        q: "What information do I need to get started?",
        a: "To get started, we need three things: (1) Read-only access to your Google Ads account via Google's official MCC access request, which you approve in two clicks from inside your account, (2) a short intake form telling us your monthly budget, your goals, and your biggest frustration with your current ads, and (3) your website URL so we can review your landing pages. That's it. No lengthy onboarding calls, no 40-page questionnaires.",
      },
      {
        q: "How is this different from hiring a traditional marketing agency?",
        a: "Agencies charge $1,000 - $3,000 / month as a management fee, lock you into 6-month contracts, assign you to a junior account manager, and send you a monthly report nobody reads. We charge a flat rate for $300 and cover campaigns, copy, keywords, bids, and negatives. Then you own everything: the account, the copy, and the strategy. No retainer, no dependency, no relationship you have to manage. If you want ongoing support, we offer it. If you just want the one-time improvement plan, you pay once and you're done.",
      },
    ],
  },
  {
    id: "pricing",
    label: "Pricing & Budget",
    faqs: [
      {
        q: "What does the $300 Audit + Rewrite include?",
        a: "Everything: a complete account audit (keywords, match types, search terms, Quality Scores, bidding, conversion tracking), rewritten ad copy for all active campaigns, a negative keyword list to reduce inefficient spend immediately, keyword restructuring recommendations, a bid strategy review, a Quality Score improvement plan, and a full written report explaining every finding and every recommended improvement in plain English. Plus 7 days of email Q&A after delivery so you can ask questions as you implement.",
      },
      {
        q: "Are there any hidden fees or recurring charges?",
        a: "None. The audit is a one-time flat rate for $300. There are no setup fees, no monthly retainers, no percentage of ad spend, and no upsells buried in the fine print. The only additional services we offer are Google Business Profile optimization for $149 and the weekly strategy sessions. Both are optional and both have flat, published prices. You decide if and when you want them.",
      },
      {
        q: "What is the minimum ad budget needed to make Google Ads worth it?",
        a: "For most local service businesses, $500 / month is the floor. Below that, you won't generate enough data for the algorithm to learn and optimize. Realistically, $800 – $1,500 / month gives you enough volume to see results within 30 days and enough data to make smart optimization decisions. If you're spending less than $500 / month on ads, your best ROI is probably getting your Google Business Profile dialed in first because it's free traffic and converts well.",
      },
      {
        q: "Do you charge a percentage of my ad spend?",
        a: "No. We charge a flat rate regardless of whether you spend $500 / month or $50,000 / month. Percentage-based fees create a conflict of interest because the agency makes more money when you spend more, whether or not that spend is profitable for you. Our flat fee means our incentive is to make your existing budget work harder, not to push you toward a bigger budget.",
      },
      {
        q: "What are the weekly strategy sessions and how do they cost?",
        a: "Weekly strategy sessions are 60-minute live working sessions where we pull up your account, review the past week's data, make real-time optimizations, and build your action plan for the coming week. We test new ad copy live, harvest new negative keywords, and adjust bids based on what's actually converting. The base rate is $60 / week, available in monthly, 3-month, and 12-month plans.",
      },
      {
        q: "What does the $149 Google Business Profile optimization include?",
        a: "A complete, keyword-optimized Google Business Profile setup: a fully rewritten business description optimized for your highest-value search terms, your complete services and products list with descriptions, your website and booking links, your correct primary and secondary categories, attribute setup (licensed, insured, women-owned, etc.), photo guidance with specific recommendations for what to upload, and a Q&A seed with the most common questions your customers ask. One-time setup, free organic traffic from Google forever.",
      },
      {
        q: "Is there a satisfaction guarantee?",
        a: "Yes. We stand behind what we deliver. If the audit missed something important, if the copy isn't right, if you have questions or something doesn't make sense, reach out and we address it. We don't hide behind refund windows or terms-of-service loopholes. If you genuinely feel we didn't deliver value, we'll make it right. The 7 days of post-delivery Q&A support exists specifically so you have direct access to us while you're implementing.",
      },
    ],
  },
  {
    id: "audit-process",
    label: "The Audit Process",
    faqs: [
      {
        q: "How do you access my Google Ads account?",
        a: "We use Google's official Manager Account (MCC) access request system. You'll get an email notification from Google asking you to approve our access request, and it takes two clicks inside your Google Ads account. We request read-only access by default, which means we can see everything but can't make any changes without your explicit approval. You can revoke our access at any time directly from your Google Ads account settings.",
      },
      {
        q: "Will you make changes to my account without asking me first?",
        a: "Never. We request read-only access for the audit. Every change we recommend comes with a written explanation of what to change, why to change it, and the exact steps to implement it yourself. If you'd like us to implement changes directly, we discuss that separately and you grant write access only after reviewing and approving the plan. Your account, your control.",
      },
      {
        q: "What does the audit report actually look like?",
        a: "It's a written document. It covers your account structure analysis, keyword-by-keyword breakdown of what's underperforming and why, a full search term report showing what your ads are actually triggering on, match type analysis, Quality Score breakdown by ad group, conversion tracking status, bid strategy assessment, and a prioritized improvement list with specific action steps. Most reports are 8–15 pages depending on account complexity.",
      },
      {
        q: "How long does the audit take to complete?",
        a: "Timing depends on account complexity, but the scope does not shrink. Every audit covers campaigns, copy, keywords, bids, and negatives. Complex accounts with multiple campaigns, locations, or product lines may take longer than simple accounts, and we'll tell you directly if we need more context before finishing the report.",
      },
      {
        q: "What if my account is new and doesn't have much historical data?",
        a: "New accounts with limited data are actually easier to improve because there's less account history to untangle. We audit structure, keyword selection, match types, ad copy, and initial settings even without conversion data. For accounts under 30 days old, we focus on preventive work: making sure you're not set up for inefficient spend from day one, rather than correcting spend that already happened. We'll flag what to watch for in your first 30 days and when to revisit the data.",
      },
      {
        q: "Can you audit Smart Campaigns or Performance Max campaigns?",
        a: "Yes, though the analysis looks different. Smart Campaigns and Performance Max give Google a lot of control and surface less data, which is often the problem. We'll assess whether the campaign type is right for your goals, what level of visibility you're sacrificing, and whether switching to standard Search campaigns would give you better control and results. In many cases, moving away from Smart Campaigns is the single biggest lever for improvement.",
      },
      {
        q: "What if I'm running ads for multiple locations or businesses?",
        a: "Multi-location accounts are common and we handle them regularly. We audit each location's campaigns and identify both shared and location-specific issues. If you're running separate campaigns per location, we'll assess whether that structure makes sense or whether consolidation would improve performance. If you have separate Google Ads accounts per location, we can audit them as a package. Reach out for custom pricing.",
      },
    ],
  },
  {
    id: "keywords",
    label: "Keywords & Targeting",
    faqs: [
      {
        q: "What are negative keywords and why do they matter so much?",
        a: "Negative keywords are the searches you tell Google you do NOT want to show up for. Without them, Google's broad match system will show your plumbing ad to people searching 'plumber salary,' 'how to become a plumber,' and 'plumber jokes.' You pay for every one of those clicks. A good negative keyword list is often the fastest way to reduce inefficient spend. Most accounts we audit are missing 80% of the negatives they should have, and improving this alone typically reduces inefficient spend by 20–35%.",
      },
      {
        q: "What keyword match types should I actually be using?",
        a: "For most local service businesses: phrase match and exact match. Broad match hands too much control to Google's algorithm and results in irrelevant traffic unless you have a large budget and sophisticated negative keyword management. Broad match modified (BMM) was removed by Google in 2021. Our recommendation for most accounts is phrase match as the primary engine with exact match for your highest-converting, most valuable searches. This gives you reach without handing Google a blank check.",
      },
      {
        q: "How do you find the right keywords for my business?",
        a: "We start with your highest-value services and work backwards. What would someone type into Google when they need exactly what you offer right now? We use Google's Keyword Planner, search term reports from your existing campaigns, and competitive analysis to build a keyword list organized by intent: emergency/urgent, comparison, informational, and commercial. Then we group them into tight ad groups so each keyword gets an ad that directly matches what the person searched.",
      },
      {
        q: "What is a search term report and why should I look at it?",
        a: "The search term report shows you the actual searches people typed when your ad appeared, not just the keyword you bid on, but the real query that triggered your ad. This is often the most surprising document in a Google Ads account. We've seen ads for 'emergency plumber' showing up for 'plumber salary in Canada,' 'plumber degree requirements,' and 'Mario the plumber.' Every one of those searches cost money. Reviewing your search terms weekly is the single most important maintenance task in any Google Ads account.",
      },
      {
        q: "Should I bid on my own brand name?",
        a: "Usually yes, and here's why: if you don't bid on your brand name, your competitors can. Someone searches 'your business name' and sees a competitor's ad at the top before your organic listing. Brand keywords are also the cheapest clicks you'll ever buy: high Quality Score, high relevance, low competition. The exception is if you have extremely strong organic rankings and no competitors bidding on your brand. We assess this case-by-case in the audit.",
      },
      {
        q: "How many keywords should I have in each ad group?",
        a: "As few as possible that still cover your intent. The old 'more keywords = more traffic' thinking is exactly backwards. It leads to ad groups with 50+ loosely related keywords, low relevance, low Quality Scores, and inefficient spend. Our recommendation: 3–10 tightly themed keywords per ad group. Each keyword in the group should be so similar that the same ad copy works perfectly for all of them. If it doesn't, split them into separate ad groups.",
      },
      {
        q: "What is Quality Score and how does it affect what I pay?",
        a: "Quality Score is Google's 1–10 rating of how relevant your keyword, ad, and landing page are to a user's search. It directly affects your ad rank and cost per click. A Quality Score of 8 can mean you pay 30–40% less per click than a competitor with a Quality Score of 4, even while outranking them. The three components are expected click-through rate, ad relevance, and landing page experience. Most accounts we audit have Quality Scores of 3–5 when they should be 7–9, and that gap is costing them real money every day.",
      },
    ],
  },
  {
    id: "ad-copy",
    label: "Ad Copy & Creative",
    faqs: [
      {
        q: "How many ads do you write per campaign?",
        a: "We write 2–3 responsive search ads per ad group, with up to 15 headlines and 4 descriptions per ad. This gives Google the material to test combinations and find what performs best. We also write copy for all active ad extensions: callouts, sitelinks, structured snippets, and call extensions. For accounts with 3–5 ad groups, that's typically 60–90 headlines total. Every headline is written to stand on its own and in combination with the others.",
      },
      {
        q: "Do I get to review and approve the copy before it goes live?",
        a: "Yes, always. We hand you the new copy in a written deliverable so you can review it, ask questions, request changes, and decide when to implement. Nothing goes live without your explicit sign-off. Most clients implement within 24–48 hours of receiving the copy. We're available via email for 7 days after delivery if you want to walk through anything or request adjustments.",
      },
      {
        q: "What makes an effective Google Ads headline?",
        a: "Three things: specificity, a direct benefit or offer, and relevance to the search. 'Emergency Plumber: Here in 45 Min' beats 'Best Plumbing Services in Your Area' because it's specific, it promises something concrete, and it matches emergency intent. Good headlines include pricing ('$0 Call-Out Fee'), social proof ('200+ 5-Star Reviews'), urgency ('Available Now'), and differentiation ('Licensed, Insured & On-Time or It's Free'). Generic headlines like 'Quality Service Since 1998' get ignored.",
      },
      {
        q: "Does my landing page need to match my ad copy?",
        a: "Yes. This is one of the most common Quality Score issues we find. If your ad says 'Emergency Plumber: 45 Min Response' but your landing page is a generic 'Welcome to Our Website' homepage, Google may assign a low landing page experience score, which raises your costs and lowers your rank. Your landing page should mirror the language from your ad, deliver on whatever promise the ad makes, and have one clear call to action. We give specific landing page recommendations in every audit.",
      },
      {
        q: "What are ad extensions and should I be using them?",
        a: "Ad extensions expand your ad with additional information: callout extensions (short benefit bullets), sitelink extensions (links to specific pages), structured snippets (lists of services or products), call extensions (a clickable phone number), and location extensions (your address and map). They're free to add and dramatically increase ad visibility and click-through rate. Google reports that ads with extensions get 10–15% higher CTR on average. Yet most accounts we audit are running with zero or minimal extensions. We write and set up all relevant extensions as part of the rewrite.",
      },
      {
        q: "Do you write image or display ads?",
        a: "Our core service focuses on Google Search ads: text ads that show when someone actively searches for what you offer. These have far higher purchase intent and conversion rates than display or image ads for local service businesses. If you specifically need display or YouTube video ad creative, that's outside our current scope, but reach out and we'll point you in the right direction. For most local businesses, search ads are where the majority of your budget should live anyway.",
      },
    ],
  },
  {
    id: "results",
    label: "Results & Reporting",
    faqs: [
      {
        q: "How quickly will I see results after implementing the changes?",
        a: "Click-through rate improvements are visible within days, sometimes hours. Your ads simply start getting more clicks because the copy is better. Lead volume improvements typically show within 2–3 weeks as Google's algorithm picks up the new signals and starts showing your ads to higher-intent searchers. Cost per lead improvements compound over time as Quality Scores improve, negative keywords accumulate, and you harvest more converting search terms. Most clients report noticeable differences in the first week.",
      },
      {
        q: "What metrics should I actually be tracking?",
        a: "Four that matter: (1) Cost per lead, what you're paying per phone call or form submission, (2) Conversion rate, what percentage of clicks turn into leads, (3) Search impression share, whether you're showing up as often as you should for your target keywords, and (4) Search term quality, whether the searches triggering your ads are actually relevant. Everything else, including impressions, clicks, and CTR, only matters in the context of these four. We set up proper conversion tracking so you're measuring real outcomes, not vanity metrics.",
      },
      {
        q: "What is a good cost per lead for my industry?",
        a: "It varies significantly by industry, competition, and location, but here are rough benchmarks for common service businesses: HVAC ($35 - $80 per lead), plumbing ($25 - $60), roofing ($40 - $90), landscaping ($20 - $45), legal ($80 - $200+). If you're paying significantly more than these ranges, it usually means inefficient budget allocation toward irrelevant traffic or low conversion rates. If you're paying less, either you're in a low-competition market or your tracking isn't capturing all your leads accurately.",
      },
      {
        q: "What is ROAS and what should I expect?",
        a: "ROAS stands for Return on Ad Spend, or how much revenue you generate per dollar spent on ads. A ROAS of 3x means you get $3 back for every $1 spent. For local service businesses, ROAS is harder to measure directly because many conversions happen over the phone, and the value of a customer relationship extends over years. The better metric for most service businesses is cost per lead and lead-to-close rate. We focus on making the account easier to measure: cleaner tracking, better search terms, stronger ads, and clearer next steps.",
      },
      {
        q: "What if I don't see improvement after implementing the changes?",
        a: "Then we dig back in. We're not a software product that calls it done after delivery. We're people who stand behind what we build. If you've implemented all the recommendations and aren't seeing improvement after 3–4 weeks, contact us. We'll review what was implemented, look at the new data, and figure out what's still off. In rare cases, the issue isn't the ads at all; it's the landing page, the offer, the pricing, or the phone follow-up process. We'll tell you honestly if that's the case.",
      },
      {
        q: "Do you provide ongoing reporting after the initial audit?",
        a: "The initial audit includes a full written report and 7 days of Q&A. For ongoing reporting, that's covered in our weekly strategy sessions. We pull up live account data in every session and review what's changed. If you want formal monthly reports without the live sessions, reach out and we can discuss what that looks like. Most clients find the weekly live sessions more actionable than static monthly PDFs.",
      },
      {
        q: "What is the single biggest mistake people make with Google Ads?",
        a: "Running broad match keywords without a negative keyword list. It sounds boring, but it's the root cause of the majority of inefficient ad spend we see. Broad match tells Google 'show my ad for anything even loosely related to this word,' and Google takes that permission and runs with it. Without negatives to rein it in, you end up funding searches that have nothing to do with your business. The second biggest mistake is no conversion tracking, which means you're working without reliable data on what's actually working.",
      },
    ],
  },
]

export const faqCategoryLinks: Record<string, FAQCategoryLink[]> = {
  "getting-started": [
    {
      label: "Start with the Audit & Rewrite",
      href: routes.google.services.AdsAudit,
    },
    { label: "Compare all offers", href: routes.google.pricing + "#offers" },
  ],
  pricing: [
    { label: "Compare all offers", href: routes.google.pricing + "#offers" },
    {
      label: "Google Ads Audit & Rewrite pricing",
      href: routes.google.services.AdsAudit + "#pricing",
    },
  ],
  "audit-process": [
    {
      label: "Google Ads audit process details",
      href: routes.google.services.AdsAudit + "#how-it-works",
    },
  ],
  keywords: [
    {
      label: "Google Ads Audit & Rewrite details",
      href: routes.google.services.AdsAudit + "#features",
    },
  ],
  "ad-copy": [
    {
      label: "See before/after ad examples by industry",
      href: `${routes.google.industry.Index}`,
    },
  ],
  results: [
    {
      label: "Weekly results timeline",
      href: routes.google.services.WeeklyStrategy + "#results",
    },
  ],
}

export const faqItems = faqCategories.flatMap((category) => category.faqs)
