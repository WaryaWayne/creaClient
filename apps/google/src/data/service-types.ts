export interface ServiceType {
  slug: string
  name: string
  adNoun?: string
  industry: string
  tagline: string
  headline: [string, string] // [normal part, primary-colored part]
  subheadline: string
  urgencyTrigger: string
  painPoints: {
    title: string
    body: string
  }[]
  badAd: {
    url: string
    headline: string
    description: string
    whatsWrong: string[]
  }
  goodAd: {
    url: string
    headline: string
    description: string
    extensions: string[]
    whyItConverts: string[]
  }
  stats: {
    number: string
    label: string
    sublabel: string
  }[]
}

export const serviceTypes: ServiceType[] = [
  {
    slug: "plumbers",
    name: "Plumbers",
    adNoun: "Plumbing Ads",
    industry: "plumbing",
    tagline: "Google Ads for Plumbers",
    headline: [
      "Your Plumbing Ads Should Bring In Urgent Calls.",
      "Let's Tighten the Campaign Before the Next Emergency Search.",
    ],
    subheadline:
      "Broad keywords, generic copy, and weak urgency can send spend toward low-intent searches while competitors with clearer campaigns answer the 2am emergency calls.",
    urgencyTrigger:
      "A burst pipe at 2am can turn into a valuable emergency job when the right plumber's ad shows up first. Broad match keywords and generic copy widen the gap between spend and booked calls. We tighten that before your next campaign runs.",
    painPoints: [
      {
        title: "Your Budget Is Flowing to the Wrong Searches",
        body: '"Plumber" on broad match means Google shows your ad for "how to become a plumber," "plumber salary," and "DIY plumbing tips." You\'re funding homework projects, not emergency calls.',
      },
      {
        title: "Generic Copy Does Not Match Emergency Intent",
        body: 'Your ad says "Family plumbing company serving the area." Someone with a flooded basement needs a clear response-time promise. "Here in 60 minutes" is more useful than generic service copy.',
      },
      {
        title: "Your Landing Page Loses the Lead",
        body: "You paid for the click. They land on your homepage, see a wall of text and a stock photo of a wrench, and leave. No clear offer. No fast phone number. No easy next step.",
      },
      {
        title: "You're Paying for Clicks That Will Never Call",
        body: "Renters researching, homeowners price-shopping at 10pm, and students doing research papers can all click your ads. Tight negative keyword lists and exact match types reduce that waste.",
      },
    ],
    badAd: {
      url: "cheap+plumber / services+call now",
      headline: "Call Now +16135555555 | Always Best Service",
      description:
        "Plumbing services for all your plumbing needs. We are the best plumbers. Call for plumbing today.",
      whatsWrong: [
        '"Plumbing" repeated 4 times: keyword stuffing, not copy',
        "No urgency, no time promise, no clear reason to call",
        '"Best plumbers": unsubstantiated, everyone says it',
        "Generic URL: no landing page intent match",
        "No offer or meaningful differentiator",
      ],
    },
    goodAd: {
      url: "johnsplumbing.com/emergency-plumber",
      headline: "Emergency Plumber | Here in 60 Min | $0 Call-Out Fee",
      description:
        "Burst pipe or blocked drain? Licensed plumbers arrive in 60 minutes flat. Fixed prices, no hidden fees. 300+ 5-star reviews. Call now. We answer 24/7.",
      extensions: [
        "Emergency Repairs",
        "Free Quote",
        "5-Star Reviews",
        "Financing",
      ],
      whyItConverts: [
        '"60 minutes": specific time promise creates urgency',
        '"$0 call-out fee" addresses a common price objection upfront',
        "Social proof baked into the copy",
        '"24/7" matches the emergency intent of the search',
        "Relevant URL: signals intent match to Google",
      ],
    },
    stats: [
      {
        number: "High-intent",
        label: "plumbing calls",
        sublabel: "Often start with urgent local search",
      },
      {
        number: "Higher",
        label: "call intent",
        sublabel: "When response time is in the ad",
      },
      {
        number: "$8 - $18",
        label: "avg cost per click",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "Fast",
        label: "decision window",
        sublabel: "On emergency plumbing searches",
      },
    ],
  },
  {
    slug: "tow-trucks",
    name: "Tow Trucks",
    adNoun: "Towing Ads",
    industry: "towing & roadside",
    tagline: "Google Ads for Towing Companies",
    headline: [
      "Your Towing Ads Should Reach Stranded Drivers Fast.",
      "Let's Focus Spend on Calls That Can Become Jobs.",
    ],
    subheadline:
      "Stranded drivers usually call the first ad that looks legitimate and fast. Wrong keywords, no ETA, and weak mobile CTAs can send budget toward low-value searches instead of real roadside calls.",
    urgencyTrigger:
      "Roadside emergencies are quick decisions. The driver wants to know who can get there fastest, what it may cost, and whether the operator looks legitimate before they tap to call.",
    painPoints: [
      {
        title: "No ETA Means Less Confidence",
        body: 'The main thing a stranded driver wants to know is how fast you can arrive. If your ad doesn\'t lead with a response time, "45-minute response" is more compelling than "towing services available."',
      },
      {
        title: "Wrong Keywords Bring the Wrong Traffic",
        body: '"Tow truck" on broad match can pull in searches for tow truck toys, tow truck games, tow truck driver jobs, and tow truck movie reviews. Those clicks are unlikely to become towing calls.',
      },
      {
        title: "No Mobile-First CTA = Drivers Just Move On",
        body: "Many towing searches happen on a phone. If your ad doesn't have a visible call extension front and center, you're adding extra steps between a stressed driver and your phone ringing.",
      },
      {
        title: "You're Bidding Against Yourself",
        body: 'Running "tow truck," "towing," and "tow service" as separate broad match keywords can overlap heavily. That makes it harder to control CPCs and understand which searches actually produce jobs.',
      },
    ],
    badAd: {
      url: "quicktow.com",
      headline: "Tow Truck Services | We Tow Cars | Call Quick Tow Today",
      description:
        "Best tow truck company. We provide towing services for all vehicles. Call us now for towing.",
      whatsWrong: [
        '"Tow" repeated 5 times: keyword stuffing, not useful copy',
        "No ETA, no price, no reason to call you vs. anyone else",
        '"Best tow truck": unproven and not credible on its own',
        "Generic homepage URL: no trust signal",
        "No mobile call extension or urgency trigger",
      ],
    },
    goodAd: {
      url: "acemetowing.com/emergency-tow",
      headline: "Tow Truck | 45-Min Response | Flatbed & Roadside | 24/7",
      description:
        "Stuck on the highway? Our flatbed tow trucks arrive in 45 minutes or less. GPS dispatch, licensed & insured, upfront pricing. Tap to call for live dispatch.",
      extensions: [
        "Call Now",
        "Roadside Assistance",
        "Flatbed Towing",
        "Free ETA Quote",
      ],
      whyItConverts: [
        '"45-minute response": answers the driver\'s main question quickly',
        '"Flatbed" signals professional equipment, not a pickup truck',
        '"Tap to call": mobile-first CTA removes friction',
        '"Live dispatch": reassures drivers that someone will answer',
        "Upfront pricing eliminates the fear of getting gouged",
      ],
    },
    stats: [
      {
        number: "Mobile-first",
        label: "roadside searches",
        sublabel: "Often happen from a phone",
      },
      {
        number: "Minutes",
        label: "to choose a provider",
        sublabel: "After clicking a towing ad",
      },
      {
        number: "$8 - $22",
        label: "avg CPC in towing",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "Top",
        label: "ad positions matter",
        sublabel: "Especially for urgent towing searches",
      },
    ],
  },
  {
    slug: "dentists",
    name: "Dentists",
    adNoun: "Dental Ads",
    industry: "dentistry",
    tagline: "Google Ads for Dental Practices",
    headline: [
      "Your Dental Ads Should Turn Urgent Searches Into Appointments.",
      "Let's Make the Offer Clear Before Patients Choose Another Practice.",
    ],
    subheadline:
      "Generic copy, wrong keywords, and no clear offer can drain your ad budget while nearby practices capture emergency patients who need same-day help.",
    urgencyTrigger:
      "Dental pain creates high-urgency searches. The person typing 'emergency dentist near me' may be ready to book quickly, so your ad needs availability, pricing, and insurance details upfront.",
    painPoints: [
      {
        title: "You're Getting Clicks From Poor-Fit Searches",
        body: "Broad match keywords can pull in Medicaid-only patients, people looking for free clinics, and dental students doing research. Those searches may not match your fee-for-service appointment goals.",
      },
      {
        title: '"We Accept New Patients" Is Not Enough',
        body: "Every practice that's not full says that. You need an offer: same-day appointments, $0 emergency exam, or a specific service with a price. Generic copy gets scrolled past.",
      },
      {
        title: "Insurance Confusion Reduces Conversions",
        body: "If your ad doesn't clarify what insurance you take, or that you offer payment plans, hesitation can cost the click. Address it in the copy so patients know whether they can book.",
      },
      {
        title: "Competitors Are Outbidding You on Your Own Brand",
        body: "If you're not bidding on your own practice name, competitors may appear above you and intercept referral traffic. A small brand campaign can protect those searches.",
      },
    ],
    badAd: {
      url: "smiledental.com",
      headline: "Dentist Services | Smile Dental | Quality Dental Care",
      description:
        "Professional dental services for the whole family. We accept new patients. Call to book an appointment today.",
      whatsWrong: [
        '"Quality dental care": the most overused phrase in dental ads',
        '"We accept new patients": not a reason to choose you',
        "No price, no availability, no urgency",
        "Generic URL: no landing page for the specific intent",
        "Nothing that separates you from 40 other dentists on the page",
      ],
    },
    goodAd: {
      url: "smiledental.com/emergency-dentist",
      headline: "Emergency Dentist | Same-Day Appts | $0 Exam Today",
      description:
        "Tooth pain? Cracked or broken tooth? We see emergency patients same day, often within 2 hours. $0 emergency exam for new patients. Most insurance accepted. Call now.",
      extensions: [
        "Book Same-Day",
        "Emergency Exam",
        "Insurance Info",
        "Financing Options",
      ],
      whyItConverts: [
        '"Same-Day Appts": resolves the urgency immediately',
        '"$0 Exam": removes the financial barrier to calling',
        '"Within 2 hours": specific and useful when operationally accurate',
        '"Most insurance accepted": eliminates hesitation',
        "Intent-matched landing page URL",
      ],
    },
    stats: [
      {
        number: "High-intent",
        label: "dental emergencies",
        sublabel: "Often begin with local search",
      },
      {
        number: "Fast",
        label: "booking decisions",
        sublabel: "For emergency dental searches",
      },
      {
        number: "$6 - $16",
        label: "avg CPC for dental",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "Clearer",
        label: "appointment intent",
        sublabel: "With same-day offer in copy",
      },
    ],
  },
  {
    slug: "locksmiths",
    name: "Locksmiths",
    adNoun: "Locksmith Ads",
    industry: "locksmithing",
    tagline: "Google Ads for Locksmiths",
    headline: [
      "Your Locksmith Ads Need to Build Trust Fast.",
      "Let's Make Price, ETA, and Local Credibility Clear.",
    ],
    subheadline:
      "Wrong match types, no upfront pricing, and a domain that looks like an aggregator can make cautious customers choose another locksmith, even when your ad gets the click.",
    urgencyTrigger:
      "Being locked out at 11pm is a fast decision. Customers usually call the first ad that looks legitimate, local, clear on pricing, and available right now.",
    painPoints: [
      {
        title:
          "The Locksmith Industry Has a Trust Problem, and You're Paying for It",
        body: "Google users are suspicious of locksmith ads because many buyers have seen bait-and-switch pricing. If your copy doesn't signal legitimate (licensed, local, upfront pricing), they skip you for someone who does.",
      },
      {
        title: "Fake Listings Are Pulling Demand Away",
        body: "Lead generation companies bid on locksmith keywords and resell the leads to you at a premium. You pay twice: once for the ad click you're competing against, and once for the lead they generated from that click.",
      },
      {
        title: "Not Showing Your Flat Rate Can Create Suspicion",
        body: 'Bait-and-switch pricing has made locksmith buyers cautious. If you can offer a real flat rate, "$85 flat rate" in your headline is a trust signal, not a liability.',
      },
      {
        title: "No After-Hours Signal Means Missed Urgent Calls",
        body: 'Many locksmith calls happen outside business hours. If your ad doesn\'t say "24/7" or "available now," urgent searchers may skip to a provider that clearly answers after hours.',
      },
    ],
    badAd: {
      url: "locksmiths-near-me.com/locksmith",
      headline: "Locksmith Services | Fast Locksmith | Locksmith Near You",
      description:
        "Professional locksmith services. We unlock doors and make keys. Call our locksmith today for locksmith help.",
      whatsWrong: [
        '"Locksmith" used 5 times: keyword stuffing with little value',
        "Looks like a lead-gen aggregator, not a real local business",
        "No pricing, no response time, no trust signals",
        "Generic domain URL looks like an aggregator to cautious searchers",
        "No 24/7 or after-hours mention",
      ],
    },
    goodAd: {
      url: "precisionlock.com/lockout-service",
      headline: "Licensed Locksmith | $85 Flat Rate | Here in 30 Min | 24/7",
      description:
        "Locked out? Licensed local locksmith arrives in 30 minutes. $85 flat rate, no surprise fees, ever. Home, car, or business. Verified & insured. Call now. A real person answers.",
      extensions: [
        "Car Lockout",
        "Home Lockout",
        "Key Duplication",
        "24/7 Emergency",
      ],
      whyItConverts: [
        '"Licensed": instant trust signal in a trust-sensitive industry',
        '"$85 flat rate": addresses a common fear around bait-and-switch pricing',
        '"30 minutes": specific ETA beats every vague competitor',
        '"Real person answers": addresses the fear of bots and runaround',
        '"Verified & insured": two more trust signals in one line',
      ],
    },
    stats: [
      {
        number: "Trust-first",
        label: "lockout calls",
        sublabel: "Often go to the clearest local option",
      },
      {
        number: "$12 - $28",
        label: "avg CPC for locksmiths",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "24/7",
        label: "when most calls happen",
        sublabel: "Peak demand: evenings & weekends",
      },
      {
        number: "Clearer",
        label: "pricing confidence",
        sublabel: "When flat rate is shown in ad",
      },
    ],
  },
  {
    slug: "hvac",
    name: "HVAC",
    adNoun: "HVAC Ads",
    industry: "heating & cooling",
    tagline: "Google Ads for HVAC Companies",
    headline: [
      "Your HVAC Ads Should Match Seasonal Demand.",
      "Let's Focus Spend on Repair Calls and Replacement Leads.",
    ],
    subheadline:
      "HVAC demand changes by season, service type, and urgency. If your campaigns use the same keywords and copy year-round, you can miss peak repair calls while overspending on lower-intent searches.",
    urgencyTrigger:
      "An AC failure in peak summer can be urgent, especially for families with health concerns. Your ad needs to show same-day availability, credentials, and financing options before the caller chooses another contractor.",
    painPoints: [
      {
        title: "Your Budget Is Misaligned in the Off-Season",
        body: "Running the same campaign year-round means you're treating furnace searches in January and AC clicks in July the same way. Seasonal campaign structuring helps reduce off-target spend and improve budget control.",
      },
      {
        title: "Generic 'HVAC Services' Copy Misses the Specific Need",
        body: 'You need to speak to the emergency: "AC Repair Same Day" for summer, "Furnace Fixed Today" for winter. Generic "HVAC services" copy does not match the specific problem the searcher needs fixed.',
      },
      {
        title: "Your Ad Doesn't Mention Financing",
        body: "A new HVAC system can cost thousands of dollars. If your ad doesn't mention financing options, customers who need payment flexibility may keep scrolling.",
      },
      {
        title: "Competitors Are Running Same-Day Guarantee Copy",
        body: 'If you can do same-day service, say it. "Guaranteed same-day" in your headline is a strong HVAC offer when you can fulfill it. If you\'re not saying it and a competitor is, they may win that urgent call.',
      },
    ],
    badAd: {
      url: "hvac-company.com",
      headline: "HVAC Services | Heating and Cooling | HVAC Company",
      description:
        "Professional HVAC services for heating and cooling. We service all HVAC systems. Call for HVAC service today.",
      whatsWrong: [
        '"HVAC" repeated 4 times: stuffed with keywords, no human value',
        "No urgency for the specific emergency (heat/cold)",
        "No response time, no same-day offer, no financing mention",
        "Could be anyone: no differentiator in any line",
        "Generic domain URL does not build trust",
      ],
    },
    goodAd: {
      url: "coolairpros.com/emergency-ac-repair",
      headline: "AC Repair Same Day, Guaranteed | $0 Diagnostic | 24/7",
      description:
        "AC out in the heat? Our NATE-certified techs arrive same day, guaranteed. $0 diagnostic fee. All brands serviced. Financing available. Call now. Real dispatch, not a call center.",
      extensions: [
        "Same-Day AC Repair",
        "Furnace Repair",
        "Free Estimates",
        "Financing Options",
      ],
      whyItConverts: [
        '"Same Day, Guaranteed": a strong urgency claim when the team can fulfill it',
        '"$0 Diagnostic": removes the first financial barrier',
        '"NATE-certified": specific credential builds instant credibility',
        '"Financing available": opens the door for big-ticket jobs',
        '"Real dispatch": differentiates from answering service competitors',
      ],
    },
    stats: [
      {
        number: "Seasonal",
        label: "HVAC demand spikes",
        sublabel: "Often around heatwaves and cold snaps",
      },
      {
        number: "$8 - $20",
        label: "avg CPC for HVAC",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "Same-day",
        label: "service copy",
        sublabel: "Can improve urgency when accurate",
      },
      {
        number: "Financing",
        label: "matters on replacements",
        sublabel: "Especially for big-ticket jobs",
      },
    ],
  },
  {
    slug: "electricians",
    name: "Electricians",
    adNoun: "Electrical Ads",
    industry: "electrical",
    tagline: "Google Ads for Electricians",
    headline: [
      "Your Electrical Ads Need to Prove Safety and Speed.",
      "Let's Make Licensing, Response Time, and Services Clear.",
    ],
    subheadline:
      "Wrong match types, generic copy, and weak landing pages can waste budget. Homeowners in an electrical emergency call the provider that looks licensed, insured, specific, and available fast.",
    urgencyTrigger:
      "Electrical emergencies carry real safety concerns. The person searching 'emergency electrician' needs a credible local expert, so your ad should lead with license status, insurance, and response time.",
    painPoints: [
      {
        title: "Safety Is the Main Conversion Concern",
        body: 'Most electrical ads sound generic. If someone is worried about a fire hazard, the ad that says "Licensed. Insured. Here in 2 hours." is more reassuring than "electrical services for all your needs."',
      },
      {
        title: "Panel Upgrade Demand Is Passing You By",
        body: "200-amp panel upgrades can be high-value jobs, and people search for them with specific intent. If you're not running a dedicated campaign and landing page for this service, you may miss one of your better keyword segments.",
      },
      {
        title: "You're Not Adjusting Bids for Peak Demand Windows",
        body: "Electrical emergencies often rise in the evening and on weekends when DIY repairs go wrong. Bid schedules should reflect when calls are most valuable instead of treating every hour the same.",
      },
      {
        title: "Generic Copy Does Not Build Enough Trust",
        body: 'Homeowners worry about unlicensed electricians and unsafe work. If "licensed master electrician" and "fully insured" apply to your business, they belong in the headline.',
      },
    ],
    badAd: {
      url: "electricservices.com",
      headline: "Electrician Services | Electrical Work | Electricians Near Me",
      description:
        "We provide electrical services for homes and businesses. Our electricians are professional. Call for electrical help.",
      whatsWrong: [
        '"Electrical" repeated 3 times: stuffed, not written',
        "No license, no insurance mention: huge trust miss in this industry",
        "No emergency availability, no response time",
        '"Professional": the least convincing word in any service ad',
        "No specific service or price anchor",
      ],
    },
    goodAd: {
      url: "voltpro.com/emergency-electrician",
      headline: "Licensed Electrician | 2-Hr Response | All Work Guaranteed",
      description:
        "Electrical emergency? Sparks, tripped breakers, or panel issues? Licensed master electrician arrives in 2 hours. Workmanship guaranteed. Fully insured. Call now for live dispatch.",
      extensions: [
        "Panel Upgrades",
        "Emergency Repair",
        "EV Charger Install",
        "Free Estimates",
      ],
      whyItConverts: [
        '"Licensed master electrician": the credential that eliminates fear',
        '"2-Hr Response": specific ETA beats vague "fast service"',
        '"Workmanship guaranteed": reduces post-service concern',
        "Specific services in extensions = higher Quality Score",
        '"Live dispatch" differentiates from answering machine competitors',
      ],
    },
    stats: [
      {
        number: "Urgent",
        label: "electrical calls",
        sublabel: "Often book soon after search",
      },
      {
        number: "$9 - $24",
        label: "avg CPC for electrical",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "Trust",
        label: "improves with credentials",
        sublabel: "When license status is clear",
      },
      {
        number: "Evenings",
        label: "peak emergency window",
        sublabel: "6pm-10pm, weekdays",
      },
    ],
  },
  {
    slug: "roofers",
    name: "Roofers",
    adNoun: "Roofing Ads",
    industry: "roofing",
    tagline: "Google Ads for Roofing Contractors",
    headline: [
      "Your Roofing Ads Should Be Ready Before Storm Demand Hits.",
      "Let's Focus Spend on the Searches That Become Real Jobs.",
    ],
    subheadline:
      "Storm season can create high-intent roofing searches quickly. Loose geo-targeting, no insurance language, and generic copy can send strong jobs to competitors with clearer ads.",
    urgencyTrigger:
      "After a major storm, homeowners may need emergency tarping, repair guidance, and insurance help the same day. Ads should make availability, service area, and claim support clear before the next contractor gets the call.",
    painPoints: [
      {
        title:
          "Storm Response Campaigns Need to Be Ready Before the Weather Changes",
        body: "Most roofing campaigns run the same copy year-round. A dedicated storm response campaign, activated after a local weather event, helps you speak directly to emergency tarping, leak repair, and insurance-claim searches.",
      },
      {
        title: "Insurance Claim Customers Need Clear Guidance",
        body: "\"We work directly with insurance\" can be a strong line when it reflects how you operate. Claim-related searches often need documentation, inspections, and a contractor who can explain the next step clearly.",
      },
      {
        title:
          '"Free Estimate" Is Often Expected, Not Enough on Its Own',
        body: 'Many roofers offer a free estimate. Stronger copy leads with the reason to choose you: emergency tarping, insurance claim support, warranty length, or a specific repair service.',
      },
      {
        title: "Your Geo-Targeting Is Too Broad",
        body: "Roofing leads far outside your real service area can drain margin through travel time and scheduling friction. Tight targeting around the areas you can serve profitably gives the campaign a better chance of producing booked work.",
      },
    ],
    badAd: {
      url: "roofingnearme.com",
      headline: "Roofing Services | Roof Repair | Best Roofers Near You",
      description:
        "We provide quality roofing services including roof repair and replacement. Licensed roofers. Free estimate. Call today.",
      whatsWrong: [
        '"Free estimate": zero differentiation, everyone says it',
        "No storm urgency, no insurance mention",
        '"Best roofers": unsubstantiated claim, ignored by every reader',
        'No warranty, no timeframe, no credential beyond "licensed"',
        "Generic lead-gen URL screams third-party aggregator",
      ],
    },
    goodAd: {
      url: "apexroofing.com/storm-damage",
      headline: "Storm Damage Roofer | Same-Day Tarp | Insurance Specialists",
      description:
        "Roof damage after the storm? We deploy same-day emergency tarping and work directly with your insurance company. 50-year warranty on all replacements. Local, licensed, 200+ 5-star reviews. Call now.",
      extensions: [
        "Insurance Claims",
        "Emergency Tarping",
        "50-Year Warranty",
        "Storm Damage",
      ],
      whyItConverts: [
        '"Same-Day Tarp": solves the immediate emergency, not just the long job',
        '"Insurance Specialists": addresses claim support in a high-value segment',
        '"50-year warranty": gives a concrete proof point when accurate',
        'Specific social proof ("200+ 5-star reviews") is stronger than boilerplate when accurate',
        "Intent-matched URL: they landed where they searched",
      ],
    },
    stats: [
      {
        number: "Storm-driven",
        label: "search spikes",
        sublabel: "Often follow major hail and wind events",
      },
      {
        number: "$9 - $26",
        label: "avg CPC for roofing",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "Insurance",
        label: "claim support",
        sublabel: "Can improve trust when clearly explained",
      },
      {
        number: "$8,500",
        label: "avg roofing job value",
        sublabel: "Estimated replacement project value",
      },
    ],
  },
  {
    slug: "pest-control",
    name: "Pest Control",
    adNoun: "Pest Control Ads",
    industry: "pest control",
    tagline: "Google Ads for Pest Control Companies",
    headline: [
      "Your Pest Control Ads Should Match the Exact Problem.",
      "Let's Focus the Campaign Around High-Intent Calls.",
    ],
    subheadline:
      "Untargeted keywords, generic copy, and weak urgency can waste budget while people with bed bugs, termites, rodents, or roaches choose ads that name their specific problem.",
    urgencyTrigger:
      "A bed bug discovery at night or a rodent issue in the kitchen can create immediate demand. Your ad should communicate availability, treatment type, guarantees, and discretion without overstating the outcome.",
    painPoints: [
      {
        title:
          "Specific Pest Problems Need Specific Copy",
        body: 'Many pest searches come from a visible, stressful problem. Copy that names the pest ("bed bugs?", "roaches?", "rodents?") is more relevant than generic "pest services" copy.',
      },
      {
        title: "You're Not Segmenting by Pest Type",
        body: "Bed bug treatment, termite inspection, rodent control, and mosquito spraying are four completely different services with different urgency levels, different prices, and different buyers. One generic campaign serves none of them well.",
      },
      {
        title: "Discretion Can Reduce Hesitation",
        body: 'Many residential customers would rather not advertise the problem to neighbors. If you offer discreet service or unmarked vehicles, that can be a useful trust signal in the ad.',
      },
      {
        title: "You're Missing the Seasonal Spike Window",
        body: "Ants in spring, mosquitoes in summer, rodents in fall. Your campaigns should anticipate these spikes with pre-loaded copy and elevated bids, not scramble to react after the calls stop coming.",
      },
    ],
    badAd: {
      url: "pestcontrol.com/services",
      headline: "Pest Control Services | Professional Exterminators | Call Us",
      description:
        "Pest control services for all pests. Professional exterminators for homes and businesses. Call for pest control today.",
      whatsWrong: [
        "No specific pest mentioned: misses every high-intent searcher",
        '"Professional exterminators": the most generic descriptor possible',
        "No urgency or acknowledgment of the specific pest problem",
        "No price, no guarantee, no response time",
        "Could be literally any pest company anywhere",
      ],
    },
    goodAd: {
      url: "shieldpest.com/bed-bug-treatment",
      headline: "Bed Bugs? Same-Day Treatment | Follow-Up Guarantee",
      description:
        "Found bed bugs? We treat same day with heat treatment or chemical options. Follow-up service guarantee available. Discreet service vehicles. Family & pet safe options. Call now.",
      extensions: [
        "Bed Bug Heat Treatment",
        "Termite Inspection",
        "Rodent Control",
        "Free Inspection",
      ],
      whyItConverts: [
        "Opens with the specific problem: matches the exact search intent",
        '"Same-Day": answers the immediate availability question',
        '"Follow-up guarantee": reduces the fear of paying twice when it reflects your policy',
        '"Discreet service vehicles": addresses a privacy concern',
        '"Family & pet safe": addresses safety concerns for households with children or pets',
      ],
    },
    stats: [
      {
        number: "Urgent",
        label: "pest bookings",
        sublabel: "Often happen soon after discovery",
      },
      {
        number: "$6 - $17",
        label: "avg CPC for pest control",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "Specific",
        label: "pest keywords",
        sublabel: "Usually produce clearer intent",
      },
      {
        number: "$350",
        label: "avg first treatment value",
        sublabel: "Plus recurring contract potential",
      },
    ],
  },
  {
    slug: "water-damage",
    name: "Water Damage Restoration",
    adNoun: "Water Damage Ads",
    industry: "restoration",
    tagline: "Google Ads for Water Damage Companies",
    headline: [
      "Your Water Damage Ads Need to Communicate Speed Clearly.",
      "Let's Make Emergency Calls Easier to Win.",
    ],
    subheadline:
      "Off-target keywords and generic restoration copy can miss homeowners who need emergency cleanup, insurance help, and a clear response time right now.",
    urgencyTrigger:
      "Water damage can get worse quickly, especially when moisture is not addressed. Your ad should lead with emergency availability, realistic ETA, certification, and insurance support.",
    painPoints: [
      {
        title:
          "Response Time Should Be Clear in the First Line",
        body: '"Water damage restoration services" is what many competitors say. A realistic ETA such as "on site in 60 minutes" is more useful to a homeowner dealing with active water damage.',
      },
      {
        title: "You're Not Mentioning Insurance Billing",
        body: '"We bill your insurance directly" can reduce anxiety when it is accurate. It helps homeowners understand that you can support the paperwork, not just the cleanup.',
      },
      {
        title: "Your Landing Page Isn't Designed for Someone Mid-Flood",
        body: "Someone with active water in their home needs a phone number, response time, and emergency service details immediately visible. Slow pages, slideshows, and buried forms add friction at the wrong moment.",
      },
      {
        title: "You're Missing the Mold Remediation Upsell Keywords",
        body: "Water damage and mold remediation can be related but show up as different searches. Separate campaigns and landing pages help match the emergency cleanup call and the later mold concern with more relevant copy.",
      },
    ],
    badAd: {
      url: "waterdamage.com/restoration",
      headline:
        "Water Damage Restoration | Flood Cleanup | Water Damage Repair",
      description:
        "Professional water damage restoration services. We clean up floods and water damage. Call for water damage help today.",
      whatsWrong: [
        '"Water damage" repeated several times: stuffed, not written',
        "No ETA, no insurance mention, no 24/7 signal",
        '"Professional": zero credibility in a crisis situation',
        "No urgency acknowledgment for a homeowner dealing with active damage",
        "Generic lead-gen URL pattern",
      ],
    },
    goodAd: {
      url: "rapidrestore.com/water-damage",
      headline: "Water Damage? On Site in 60 Min | We Bill Insurance Directly",
      description:
        "Active flooding or water damage? IICRC-certified technicians on site in 60 minutes. We handle all insurance paperwork directly. 24/7 emergency response. Mold prevention protocols. Call now for live dispatch.",
      extensions: [
        "24/7 Emergency",
        "Insurance Billing",
        "Mold Remediation",
        "Flood Cleanup",
      ],
      whyItConverts: [
        '"On Site in 60 Min": answers the response-time question in an active emergency',
        '"We Bill Insurance Directly": reduces paperwork concerns',
        '"IICRC-certified": the industry credential that signals legitimacy',
        '"Mold prevention protocols": addresses the next worry proactively',
        '"Live dispatch": no voicemail, no waiting',
      ],
    },
    stats: [
      {
        number: "$2,700",
        label: "avg water damage claim",
        sublabel: "Before mold, higher after",
      },
      {
        number: "Fast ETA",
        label: "matters in cleanup",
        sublabel: "Especially for active water events",
      },
      {
        number: "$18 - $45",
        label: "avg CPC for restoration",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "24/7",
        label: "peak call windows",
        sublabel: "Emergencies don't follow business hours",
      },
    ],
  },
  {
    slug: "auto-glass",
    name: "Auto Glass Repair",
    adNoun: "Auto Glass Ads",
    industry: "auto glass",
    tagline: "Google Ads for Auto Glass Companies",
    headline: [
      "Your Auto Glass Ads Should Make the Repair Easy to Book.",
      "Let's Highlight Mobile Service, Insurance, and Speed.",
    ],
    subheadline:
      "Missing insurance language, generic headlines, and no mobile-service callout can make drivers choose a competitor with a clearer, lower-friction offer.",
    urgencyTrigger:
      "A cracked windshield can be a safety and compliance issue. Drivers often want a clear repair option quickly, so the ad should show mobile service, insurance handling, and same-day availability when accurate.",
    painPoints: [
      {
        title:
          "Mobile Service Is a Strong Differentiator, and It's Not in Your Ad",
        body: "\"We come to you\" is a strong differentiator in auto glass. If you offer mobile service and your ad doesn't say it, drivers may assume they need to visit a shop.",
      },
      {
        title: "Insurance Language Can Remove a Major Objection",
        body: "Many drivers are unsure whether windshield repair or replacement is covered. If you work with insurance, make that clear and avoid implying coverage unless the policy actually applies.",
      },
      {
        title: "You're Not Competing on Chip Repair",
        body: "Chip repair is often a lower-cost service that can prevent a full replacement when handled early. A separate chip repair campaign can capture drivers before the damage spreads.",
      },
      {
        title: 'Same-Day Copy Is Clearer Than "Fast Service"',
        body: '"Fast service" is vague. "Windshield replaced today at your location" is specific and helpful when you can deliver it.',
      },
    ],
    badAd: {
      url: "autoglass.net/repair",
      headline:
        "Auto Glass Repair | Windshield Replacement | Auto Glass Service",
      description:
        "Professional auto glass repair and windshield replacement services. We fix all types of auto glass. Call today.",
      whatsWrong: [
        '"Auto glass" repeated several times: keyword stuffed',
        "No insurance mention: misses a common buying question",
        "No mobile service mention: your biggest differentiator missing",
        "No same-day or ETA promise",
        '"Professional" and "all types": the blankest copy possible',
      ],
    },
    goodAd: {
      url: "clearviewglass.com/windshield-replacement",
      headline:
        "Windshield Replaced Today | Mobile Service | $0 With Insurance",
      description:
        "Cracked windshield? We come to you: home, work, or anywhere. Same-day service. $0 out of pocket for most insurance policies. NWRA-certified technicians. Free chip repairs for insurance customers.",
      extensions: [
        "Mobile Windshield Replacement",
        "Insurance Claims",
        "Chip Repair for $49",
        "Same-Day Service",
      ],
      whyItConverts: [
        '"Mobile Service": a practical differentiator in auto glass',
        '"$0 With Insurance": qualifies covered customers when policy terms apply',
        '"Come to you": reduces the concern about driving with a cracked windshield',
        '"NWRA-certified": industry credential adds credibility',
        '"Free chip repairs for insurance customers": low-commitment entry offer',
      ],
    },
    stats: [
      {
        number: "Insurance",
        label: "coverage questions",
        sublabel: "Common in windshield searches",
      },
      {
        number: "$5 - $14",
        label: "avg CPC for auto glass",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "Same-day",
        label: "service expectation",
        sublabel: "Common for urgent windshield repairs",
      },
      {
        number: "$280",
        label: "avg windshield job value",
        sublabel: "Mobile service can support stronger offers",
      },
    ],
  },
  {
    slug: "garage-door",
    name: "Garage Door Repair",
    adNoun: "Garage Door Ads",
    industry: "garage door",
    tagline: "Google Ads for Garage Door Companies",
    headline: [
      "Your Garage Door Ads Should Answer the Emergency Fast.",
      "Let's Make Service, Timing, and Pricing Clear.",
    ],
    subheadline:
      "Wrong keywords, vague copy, and no same-day signal can lose homeowners who are stuck in a driveway, dealing with a broken spring, or trying to secure the garage before night.",
    urgencyTrigger:
      "A snapped spring at 7am can trap a car when someone needs to leave for work. Ads should make same-day availability, spring repair, and pricing expectations easy to understand.",
    painPoints: [
      {
        title: "Same-Day Availability Should Be Easy to See",
        body: "Many garage door searches are urgent. If your ad doesn't confirm same-day service when you offer it, homeowners may keep scrolling for a provider that does.",
      },
      {
        title: "You're Not Mentioning Spring Replacement",
        body: 'Broken springs are one of the most common urgent garage door issues. Dedicated "garage door spring replacement" campaigns and landing pages can match that search better than generic repair copy.',
      },
      {
        title: "Clear Pricing Helps Build Trust",
        body: 'Garage door repair buyers often worry about surprise pricing. A real price anchor such as "spring replacement from $149" can reduce hesitation when it matches your actual offer.',
      },
      {
        title: "You're Missing the After-Hours Audience",
        body: "Springs can snap early and openers can fail late. If your bids drop to zero outside of 9-5, you may miss urgent searches. Ad scheduling should reflect the hours you can actually answer and dispatch.",
      },
    ],
    badAd: {
      url: "garagedoorservices.com",
      headline: "Garage Door Repair | Garage Door Service | Fix Garage Door",
      description:
        "Garage door repair and service for all garage door brands. We fix garage doors fast. Call for garage door service.",
      whatsWrong: [
        '"Garage door" repeated 4 times: nothing but stuffing',
        "No same-day, no spring callout, no price anchor",
        '"Fast": the vaguest possible urgency claim',
        "No after-hours signal despite many emergencies happening outside 9-5",
        "Completely forgettable: identical to 30 other ads on the page",
      ],
    },
    goodAd: {
      url: "rapidgaragedoor.com/spring-repair",
      headline: "Garage Door Spring Repair | Same Day | From $149 | 7am-10pm",
      description:
        "Spring snapped or door won't open? We're on site same day, with many spring repairs completed in one visit. Transparent pricing from $149. All brands. Satisfaction guarantee available. Call now.",
      extensions: [
        "Spring Replacement",
        "Same-Day Service",
        "Opener Repair",
        "Free Quotes",
      ],
      whyItConverts: [
        '"Spring Repair": targets a common urgent repair search',
        '"Same Day": confirms the expectation instead of leaving doubt',
        '"From $149": gives a price anchor without overpromising every repair cost',
        '"7am-10pm": shows you cover extended repair hours',
        '"One visit": addresses the concern that the door will stay unusable',
      ],
    },
    stats: [
      {
        number: "Common",
        label: "urgent repair issue",
        sublabel: "Broken garage door springs",
      },
      {
        number: "$7 - $19",
        label: "avg CPC for garage door",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "Same-day",
        label: "expectation from",
        sublabel: "Common on urgent repair searches",
      },
      {
        number: "$250",
        label: "avg first job value",
        sublabel: "With strong upsell to new opener",
      },
    ],
  },
  {
    slug: "tree-service",
    name: "Tree Service",
    adNoun: "Tree Service Ads",
    industry: "tree service & arborist",
    tagline: "Google Ads for Tree Service Companies",
    headline: [
      "Your Tree Service Ads Should Separate Emergencies From Routine Work.",
      "Let's Build Campaigns Around Real Search Intent.",
    ],
    subheadline:
      "Broad keywords, generic copy, and no storm response structure can mix emergency removal searches with routine trimming leads and make both harder to convert profitably.",
    urgencyTrigger:
      "A tree across a driveway or leaning near a house creates a fast, high-stress decision. Your ad should show emergency availability, insurance support, equipment readiness, and credentials clearly.",
    painPoints: [
      {
        title:
          "Storm Response Campaigns Need Separate Copy and Landing Pages",
        body: "Most tree service companies run the same campaigns year-round. A dedicated storm damage campaign with emergency copy, adjusted bids, and a specific landing page helps match urgent removal searches when weather creates demand.",
      },
      {
        title: "Insurance Language Matters for Storm Damage",
        body: '"We work directly with your insurance company" can be valuable when accurate. Storm-damaged homeowners often need documentation, photos, and help understanding the claim process.',
      },
      {
        title: "Your Ad Doesn't Mention ISA Certification",
        body: "ISA-certified arborist is a meaningful credential for cautious homeowners. If you have it, it belongs in the headline for jobs near homes, power lines, or valuable landscaping.",
      },
      {
        title: "You're Missing the Routine Trimming Campaigns",
        body: "Emergency removal and routine trimming are two completely different buyers with different urgency levels. Mixing them into one campaign means your emergency copy bores the routine buyer and your trimming copy under-sells the emergency buyer.",
      },
    ],
    badAd: {
      url: "treesvc.com",
      headline: "Tree Service | Tree Removal | Tree Trimming Services",
      description:
        "Professional tree service company. We do tree removal, trimming, and stump grinding. Call for tree service today.",
      whatsWrong: [
        "No storm urgency for emergency removal searches",
        "No insurance mention for claim-related storm work",
        "No certification: every homeowner wonders if you're legitimate",
        '"Professional" and "services": zero differentiation',
        "No price, no ETA, no emergency signal",
      ],
    },
    goodAd: {
      url: "clearviewtree.com/storm-damage",
      headline:
        "Storm Tree Removal | Same Day | ISA Certified | Insurance Help",
      description:
        "Tree down after the storm? ISA-certified arborists on site same day. We document damage for insurance claims and handle all paperwork. Licensed, insured, and fully equipped for emergency removal. Call now.",
      extensions: [
        "Storm Emergency Removal",
        "Insurance Claims",
        "Stump Grinding",
        "Free Estimates",
      ],
      whyItConverts: [
        '"Same Day": speaks directly to the storm emergency buyer',
        '"ISA Certified": a credential that helps establish legitimacy',
        '"We document damage for insurance": answers a common storm cleanup concern',
        '"Licensed, insured, fully equipped": three trust signals in five words',
        "Intent-matched URL reinforces the storm emergency message",
      ],
    },
    stats: [
      {
        number: "Storm",
        label: "lead volume spikes",
        sublabel: "Often follow major weather events",
      },
      {
        number: "$1,800",
        label: "avg storm removal job",
        sublabel: "With insurance documentation",
      },
      {
        number: "$6 - $18",
        label: "avg CPC for tree service",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "ISA cert",
        label: "adds trust",
        sublabel: "When certification is accurate",
      },
    ],
  },
  {
    slug: "appliance-repair",
    name: "Appliance Repair",
    adNoun: "Appliance Repair Ads",
    industry: "appliance repair",
    tagline: "Google Ads for Appliance Repair Companies",
    headline: [
      "Your Appliance Repair Ads Should Match the Broken Appliance.",
      "Let's Make Same-Day Service and Parts Availability Clear.",
    ],
    subheadline:
      "Wrong keywords and generic copy can send appliance repair spend toward low-fit searches while urgent fridge, washer, dryer, and oven repair calls go to more specific ads.",
    urgencyTrigger:
      "A dead fridge or washer leak can turn into a same-day decision. Your ad should name the appliance, show availability, and explain whether common parts are stocked before the customer calls someone else.",
    painPoints: [
      {
        title: "One Generic Campaign Is the Wrong Part for Every Appliance",
        body: "Fridge repair, washer repair, dryer repair, dishwasher repair, and oven repair are five different searches with different urgency levels and different average job values. Running one campaign for all of them means your copy resonates with none of them.",
      },
      {
        title: "You're Not Mentioning Parts Availability",
        body: '"Parts on the truck" is a real differentiator. Nobody wants to wait a week for a common part. If you stock common parts and can often fix in one visit, say it clearly instead of relying on "fast service."',
      },
      {
        title: "Your Ad Doesn't Mention Brand Expertise",
        body: 'Homeowners with a $2,500 Sub-Zero fridge search "Sub-Zero refrigerator repair near me," not just "fridge repair." Brand-specific campaigns and ad copy for major appliance brands (Samsung, LG, Bosch, Whirlpool) capture the highest-value customers.',
      },
      {
        title: "Same-Day Bookings Go to Competitors Who Simply Say It",
        body: 'If you can do same-day appliance repair and your ad doesn\'t say it, urgent customers may keep scrolling. "Same-day diagnosis" is specific and useful when you can support it operationally.',
      },
    ],
    badAd: {
      url: "appliancefix.com",
      headline: "Appliance Repair Services | All Appliances | Call Today",
      description:
        "We repair all types of appliances for homes and businesses. Professional appliance repair technicians. Call for service.",
      whatsWrong: [
        '"All appliances": so generic it speaks to no one specifically',
        "No same-day mention for urgent appliance failures",
        "No brand expertise signal: misses the premium appliance customer",
        "No parts availability mention",
        '"Professional technicians": every single competitor says this',
      ],
    },
    goodAd: {
      url: "rapidappliancefix.com/refrigerator-repair",
      headline: "Fridge Repair Same Day | Parts On Truck | All Brands Covered",
      description:
        "Fridge not cooling? Our factory-trained techs arrive same day with parts on the truck. Most repairs done in one visit. Samsung, LG, Whirlpool, and all major brands. No fix, no fee guarantee. Call now.",
      extensions: [
        "Refrigerator Repair",
        "Washer & Dryer Repair",
        "Same-Day Service",
        "No Fix No Fee",
      ],
      whyItConverts: [
        '"Fridge Repair": specific appliance targets the highest-urgency search',
        '"Same Day": resolves the panic about groceries spoiling',
        '"Parts On Truck": eliminates the fear of a two-visit repair',
        '"Most repairs done in one visit": specific, credible, compelling',
        '"No fix, no fee": removes the risk of paying for a failed diagnosis',
      ],
    },
    stats: [
      {
        number: "$180",
        label: "avg appliance repair job",
        sublabel: "Fridge repairs avg higher",
      },
      {
        number: "Same-day",
        label: "service demand",
        sublabel: "Common on urgent appliance searches",
      },
      {
        number: "$6 - $16",
        label: "avg CPC for appliance",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "One-visit",
        label: "repair message",
        sublabel: "Can reduce scheduling hesitation",
      },
    ],
  },
  {
    slug: "carpet-cleaning",
    name: "Carpet Cleaning",
    adNoun: "Carpet Cleaning Ads",
    industry: "carpet & upholstery cleaning",
    tagline: "Google Ads for Carpet Cleaning Companies",
    headline: [
      "Your Carpet Cleaning Ads Should Lead With the Reason to Book.",
      "Let's Make Pricing, Timing, and Use Case Clear.",
    ],
    subheadline:
      "Broad keywords, unclear pricing, and no same-day message can lose people searching for pet stains, move-out cleaning, spills, and pre-event appointments.",
    urgencyTrigger:
      "Same-day carpet cleaning searches often come from a deadline: guests arriving, a move-out inspection, or a pet accident. Your ad should make availability, price, and dry time clear.",
    painPoints: [
      {
        title:
          '"Professional Carpet Cleaning" Is Too Generic by Itself',
        body: "Many carpet cleaning ads say professional. Lead with a specific trigger instead: pet stains, move-out cleaning, same-day service, or fast dry time.",
      },
      {
        title:
          "Clear Pricing Helps Address a Common Industry Concern",
        body: 'Carpet cleaning customers often worry about low teaser prices that turn into add-ons. Transparent pricing such as "3 rooms for $149, no hidden fees" can build trust when it matches your actual offer.',
      },
      {
        title: "Your Dry Time Matters and You're Not Mentioning It",
        body: '"Dry in 2 hours" is a useful differentiator for people who have guests coming or need to move back into a room fast. If you use fast-dry methods, say it explicitly in your copy.',
      },
      {
        title: "You're Missing the Move-Out Cleaning Campaign",
        body: 'Move-out carpet cleaning is often deadline-driven. A campaign specifically targeting "move-out carpet cleaning" with a landing page focused on availability, receipts, and expectations is more relevant than generic cleaning copy.',
      },
    ],
    badAd: {
      url: "carpetclean.com",
      headline:
        "Carpet Cleaning Services | Professional Carpet Cleaners | Call",
      description:
        "Professional carpet and upholstery cleaning services. We clean all types of carpets. Call to schedule carpet cleaning.",
      whatsWrong: [
        '"Professional carpet cleaning": little differentiation from similar ads',
        "No same-day, no urgency trigger, no price",
        '"All types of carpets": so generic it means nothing',
        "No pet stain, move-out, or specific trigger mention",
        '"Call to schedule": passive, no urgency',
      ],
    },
    goodAd: {
      url: "freshcarpet.com/same-day",
      headline: "Same-Day Carpet Cleaning | 3 Rooms for $129 | Dry in 2hrs",
      description:
        "Pet accident, spill, or move-out clean? We're there same day. 3 rooms for $129. No hidden fees, no bait-and-switch. Dry in 2 hours with our low-moisture process. Pet-safe solutions. Call now.",
      extensions: [
        "Same-Day Booking",
        "Pet Stain Treatment",
        "Move-Out Cleaning",
        "Upholstery Cleaning",
      ],
      whyItConverts: [
        '"Same-Day": answers an urgent timing question',
        '"3 rooms for $129": transparent pricing helps address bait-and-switch concerns',
        '"Dry in 2 hours": reduces a common objection to carpet cleaning',
        "Pet stain mention targets a common urgent use case",
        '"No hidden fees": addresses the industry\'s reputation problem directly',
      ],
    },
    stats: [
      {
        number: "Same-day",
        label: "cleaning searches",
        sublabel: "Often tied to deadlines or accidents",
      },
      {
        number: "$5 - $13",
        label: "avg CPC for carpet cleaning",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "$200",
        label: "avg job value",
        sublabel: "With pet treatment and upholstery upsell",
      },
      {
        number: "Clear price",
        label: "reduces friction",
        sublabel: "When the offer is accurate",
      },
    ],
  },
  {
    slug: "movers",
    name: "Moving Companies",
    adNoun: "Moving Ads",
    industry: "moving & storage",
    tagline: "Google Ads for Moving Companies",
    headline: [
      "Your Moving Ads Need to Build Trust Before the Quote.",
      "Let's Make Availability, Pricing, and Credentials Clear.",
    ],
    subheadline:
      "Broad keywords, vague moving copy, and missing trust signals can waste spend in a category where customers worry about damaged furniture, hidden fees, and unreliable crews.",
    urgencyTrigger:
      "Last-minute movers, such as someone whose lease starts soon or whose mover cancelled, need availability and a credible estimate fast. Ads should make timing, licensing, and fees clear upfront.",
    painPoints: [
      {
        title: "You're Not Leading With the Trust Signals Buyers Look For",
        body: "Moving horror stories are common: damaged furniture, missing boxes, surprise fees. If \"fully licensed, bonded & insured\" applies to your company, it should be visible early for buyers who compare providers carefully.",
      },
      {
        title:
          "Hidden Fees Are a Major Reputation Problem",
        body: '"No hidden fees, binding estimate guaranteed" directly addresses a common buyer fear when it reflects your pricing process. It is clearer than vague promises about quality service.',
      },
      {
        title:
          "You're Missing Last-Minute Moving Searches",
        body: 'Last-minute movers are high-urgency and need immediate availability. A campaign targeting "movers this weekend" and "same-week movers" with a landing page focused on open dates can be more relevant than generic moving ads.',
      },
      {
        title: "Your Local vs. Long-Distance Campaigns Shouldn't Mix",
        body: "Local moving jobs and long-distance moves are different services with different pricing and buyer concerns. One campaign serving both often makes the copy too vague for either intent.",
      },
    ],
    badAd: {
      url: "moving-company.com",
      headline:
        "Moving Services | Professional Movers | Moving Company Near Me",
      description:
        "Professional moving company for local and long-distance moves. We move homes and businesses. Call for moving services.",
      whatsWrong: [
        'No trust signal: "licensed, bonded, insured" nowhere to be found',
        "No price, no binding estimate mention: leaves the biggest fear unaddressed",
        '"Local and long-distance": too vague for either buyer',
        '"Professional movers": little differentiation from similar ads',
        "Generic URL pattern signals aggregator or franchise",
      ],
    },
    goodAd: {
      url: "atlasmovers.com/local-moving",
      headline:
        "Licensed Movers | Binding Estimate | No Hidden Fees | This Week",
      description:
        "Moving this week? Fully licensed, bonded & insured movers with a guaranteed binding estimate. No surprise charges on move day. Furniture protection included. 500+ 5-star reviews. Free quote in 2 minutes. Call now.",
      extensions: [
        "Free Moving Quote",
        "Same-Week Availability",
        "Packing Services",
        "Storage Options",
      ],
      whyItConverts: [
        '"Licensed, bonded & insured": important trust language for cautious moving customers',
        '"Binding estimate": addresses the fear of move-day pricing surprises',
        '"No Hidden Fees": direct and explicit trust builder',
        '"Furniture protection included": speaks to the fear of damage',
        '"500+ 5-star reviews": social proof in a trust-sensitive purchase when accurate',
      ],
    },
    stats: [
      {
        number: "$300",
        label: "avg local moving job",
        sublabel: "Long-distance averages $4,800+",
      },
      {
        number: '"Hidden fees"',
        label: "is a common fear",
        sublabel: "Among moving customers",
      },
      {
        number: "$10 - $28",
        label: "avg CPC for movers",
        sublabel: "Estimated US non-brand search range",
      },
      {
        number: "Last-minute",
        label: "campaigns match",
        sublabel: "High-urgency moving searches",
      },
    ],
  },
]

export function getServiceBySlug(slug: string): ServiceType | undefined {
  return serviceTypes.find((s) => s.slug === slug)
}
