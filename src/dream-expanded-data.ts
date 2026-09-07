export type ExpandedDreamSeed = { slug: string; title: string; category: string; theme: string; aliases: string[] };

export const DREAM_THEME_META = {
  animals: { title: "Animals", description: "Animal dreams often foreground instinct, attachment, threat, care, or qualities the dreamer associates with a species." },
  relationships: { title: "People & Relationships", description: "Relationship dreams often rehearse attachment, conflict, memory, projection, boundaries, and changing social roles." },
  places: { title: "Places & Buildings", description: "Dream places can act like emotional maps: settings organize memory, safety, transition, belonging, and hidden parts of experience." },
  nature: { title: "Nature & Weather", description: "Weather and landscapes often mirror intensity, change, exposure, renewal, and the dreamer's sense of scale or control." },
  objects: { title: "Objects & Symbols", description: "Objects in dreams often concentrate questions of value, access, identity, communication, control, and practical responsibility." },
  body: { title: "Body & Appearance", description: "Body dreams commonly reflect agency, vulnerability, self-image, expression, stress, and the felt experience of change; they are not diagnoses." },
  travel: { title: "Travel & Movement", description: "Travel dreams frequently revolve around direction, control, timing, transition, delay, independence, and shared versus personal momentum." },
  nightmares: { title: "Nightmares & Threats", description: "Nightmares often amplify fear, helplessness, boundary violations, overload, and unresolved tension; imagery is not a literal prediction." },
  "work-success": { title: "Work, Money & Success", description: "Work and achievement dreams often process evaluation, responsibility, competition, recognition, security, and fear of failure." },
  mystical: { title: "Mystical & Spiritual Symbols", description: "Mystical imagery can express meaning-making, conscience, awe, uncertainty, taboo, guidance, and the wish for a larger pattern without proving supernatural causes." }
} as const;

const RAW = `
animals|dog|Dog|loyalty, protection, companionship, and the quality of trust around you
animals|cat|Cat|independence, intuition, boundaries, and moving on your own terms
animals|wolf|Wolf|instinct, belonging, hierarchy, and the tension between solitude and the pack
animals|bear|Bear|strength, protection, retreat, and power that may need calm handling
animals|lion|Lion|courage, pride, authority, and how confidently you occupy space
animals|tiger|Tiger|focused power, intensity, ambition, and a force that commands respect
animals|horse|Horse|drive, freedom, stamina, and the direction of your momentum
animals|cow|Cow|nourishment, patience, domestic security, and dependable resources
animals|pig|Pig|appetite, abundance, messiness, and your relationship with comfort or excess
animals|rabbit|Rabbit|sensitivity, quick reactions, creativity, and alertness to risk
animals|mouse|Mouse|small worries, overlooked details, and problems that grow when ignored
animals|rat|Rat|survival, suspicion, adaptability, and concern about betrayal or contamination
animals|fox|Fox|cleverness, strategy, ambiguity, and the need to read a situation carefully
animals|deer|Deer|gentleness, vulnerability, grace, and moving carefully through uncertainty
animals|elephant|Elephant|memory, family bonds, patience, and the weight of long-held experience
animals|monkey|Monkey|curiosity, play, distraction, imitation, and a restless social mind
animals|gorilla|Gorilla|raw strength, dominance, protection, and unspoken power dynamics
animals|whale|Whale|deep emotion, vast inner life, communication, and feelings too large for ordinary language
animals|dolphin|Dolphin|playfulness, intelligence, social ease, and emotional breathing space
animals|shark|Shark|predatory pressure, fear, competitiveness, and a threat that feels relentless
animals|octopus|Octopus|complexity, many demands at once, adaptability, and entanglement
animals|fish|Fish|emotional currents, intuition, abundance, and material rising from below awareness
animals|frog|Frog|transition, cleansing, awkward growth, and adapting between environments
animals|turtle|Turtle|self-protection, patience, home carried with you, and durable progress
animals|butterfly|Butterfly|transformation, fragility, beauty, and identity emerging through change
relationships|mother|Mother|care, origin, dependence, protection, and unresolved feelings about nurture
relationships|father|Father|authority, guidance, approval, boundaries, and your relationship with structure
relationships|sibling|Sibling|comparison, rivalry, loyalty, shared history, and roles learned in family life
relationships|grandmother|Grandmother|ancestry, wisdom, continuity, care, and inherited expectations
relationships|grandfather|Grandfather|legacy, authority, tradition, and lessons carried from earlier generations
relationships|ex-partner|Ex Partner|unfinished emotion, comparison with the present, and an old relational pattern resurfacing
relationships|crush|Crush|hope, projection, attraction, and qualities you may be longing to experience
relationships|stranger|Stranger|an unfamiliar part of yourself, uncertainty, or a new influence entering awareness
relationships|crowd|Crowd|social pressure, belonging, anonymity, and concern about how you are seen
relationships|celebrity|Celebrity|idealization, status, aspiration, and qualities you admire or wish to embody
relationships|boss|Boss|authority, performance pressure, ambition, and concerns about evaluation
relationships|teacher|Teacher|learning, judgment, guidance, and a lesson your mind believes is unfinished
relationships|child|Child|vulnerability, play, dependency, new potential, and an earlier version of yourself
relationships|old-friend|Old Friend|nostalgia, forgotten qualities, unfinished connection, and a past social identity
relationships|enemy|Enemy|conflict, projection, fear, and a trait or situation experienced as threatening
relationships|wedding|Wedding|commitment, union, transition, and bringing two parts of life together
relationships|divorce|Divorce|separation, boundary-setting, grief, and the ending of a shared identity
relationships|kissing|Kissing|intimacy, approval, attraction, and a wish for emotional or social closeness
relationships|hugging|Hugging|comfort, reconciliation, acceptance, and a desire to feel safely connected
relationships|argument|Argument|unspoken tension, competing needs, and conflict looking for expression
relationships|reunion|Reunion|return, reconciliation, nostalgia, and the reappearance of something once lost
relationships|betrayal|Betrayal|mistrust, vulnerability, fear of disloyalty, and concern that an agreement is unstable
relationships|jealousy|Jealousy|comparison, insecurity, protectiveness, and fear of losing attention or value
relationships|proposal|Proposal|commitment, choice, expectation, and anxiety about saying yes to major change
relationships|date|Date|evaluation, attraction, anticipation, and testing the fit between desire and reality
places|school|School|learning, evaluation, social memory, and feeling tested by old standards
places|hospital|Hospital|repair, vulnerability, concern, and a need for care without implying literal illness
places|church|Church|conscience, reverence, belonging, and questions of meaning or moral authority
places|temple|Temple|sacred focus, devotion, inner order, and a search for perspective
places|cemetery|Cemetery|memory, endings, grief, and parts of the past still asking to be acknowledged
places|forest|Forest|uncertainty, instinct, exploration, and entering territory without a clear map
places|desert|Desert|scarcity, solitude, endurance, and a period stripped to essentials
places|mountain|Mountain|challenge, ambition, perspective, and the effort required to reach a goal
places|beach|Beach|the boundary between everyday awareness and emotion, rest, and transition
places|island|Island|isolation, independence, refuge, and being cut off from usual support
places|city|City|complexity, opportunity, overstimulation, and navigating many social demands
places|village|Village|community, familiarity, tradition, and the comfort or pressure of close ties
places|hotel|Hotel|temporary identity, transition, travel, and living between stable chapters
places|airport|Airport|departure, anticipation, waiting, and movement toward a new phase
places|train-station|Train Station|timing, choice of direction, missed opportunities, and coordinated movement
places|bridge|Bridge|transition, connection, risk, and crossing from one state to another
places|tunnel|Tunnel|uncertainty, confinement, passage, and moving through a difficult in-between
places|staircase|Staircase|progress, regression, status, and moving between levels of responsibility
places|elevator|Elevator|rapid change, rising or falling status, and movement partly outside your control
places|basement|Basement|buried memory, neglected emotion, storage, and material kept below awareness
places|attic|Attic|old memories, inherited ideas, forgotten possessions, and mental material stored away
places|bathroom|Bathroom|privacy, release, embarrassment, and the need to cleanse or let go
places|kitchen|Kitchen|nourishment, preparation, family routines, and transforming raw material into something usable
places|bedroom|Bedroom|privacy, intimacy, rest, sexuality, and what remains when public roles are removed
places|office|Office|work identity, responsibility, routine, and performance pressure
nature|rain|Rain|release, sadness, renewal, and emotion finally being allowed to fall
nature|storm|Storm|emotional turbulence, conflict, sudden change, and forces that feel bigger than you
nature|lightning|Lightning|shock, insight, rupture, and a sudden event changing the emotional landscape
nature|thunder|Thunder|warning, impact, anticipation, and the emotional echo of something powerful
nature|snow|Snow|stillness, isolation, purity, numbness, and a landscape temporarily covered over
nature|ice|Ice|emotional freezing, caution, brittleness, and conditions where movement needs care
nature|wind|Wind|change, unseen influence, instability, and pressure whose source is hard to locate
nature|tornado|Tornado|chaos, loss of control, upheaval, and fear of being pulled into turmoil
nature|hurricane|Hurricane|sustained emotional pressure, disruption, and the need to protect what matters
nature|earthquake|Earthquake|shaken foundations, instability, and a belief or structure no longer feeling secure
nature|volcano|Volcano|contained pressure, anger, passion, and emotion nearing a point of release
nature|mud|Mud|stuckness, confusion, shame, and difficulty getting clean movement or clarity
nature|sand|Sand|impermanence, time, weak foundations, and things difficult to hold onto
nature|tree|Tree|growth, roots, family, resilience, and the relationship between history and future development
nature|flowers|Flowers|beauty, affection, growth, recognition, and something reaching a visible stage
nature|rose|Rose|love, beauty, desire, tenderness, and attraction existing beside vulnerability
nature|garden|Garden|cultivation, patience, care, and results that depend on sustained attention
nature|jungle|Jungle|overgrowth, instinct, complexity, and navigating dense territory with limited visibility
nature|cave|Cave|retreat, hidden knowledge, fear, and entering a deep private part of yourself
nature|cliff|Cliff|risk, hesitation, perspective, and the edge of a major decision
nature|moon|Moon|cycles, reflection, intuition, changing moods, and attention to what is indirect or half-seen
nature|sun|Sun|clarity, vitality, visibility, confidence, and something coming fully into awareness
nature|stars|Stars|hope, direction, distance, aspiration, and looking for guidance beyond immediate circumstances
nature|rainbow|Rainbow|relief after difficulty, integration, hope, and the perception of possibility
nature|eclipse|Eclipse|temporary obscuring, transition, awe, and one concern overshadowing another
objects|phone|Phone|communication, availability, interruption, and anxiety about connection or missed messages
objects|computer|Computer|workload, information, control, and the relationship between thinking and automation
objects|television|Television|passive observation, influence, distraction, and watching life rather than participating
objects|camera|Camera|memory, self-image, observation, and concern about how moments are captured or judged
objects|mirror|Mirror|self-image, identity, recognition, and confrontation with how you see yourself
objects|clock|Clock|time pressure, deadlines, aging, and awareness that a window may be closing
objects|key|Key|access, solution, permission, and discovering what can unlock a blocked situation
objects|lock|Lock|boundaries, exclusion, secrecy, and something unavailable until the right condition is met
objects|door|Door|choice, opportunity, privacy, and a threshold between one state and another
objects|window|Window|perspective, possibility, separation, and seeing something without yet entering it
objects|book|Book|knowledge, memory, narrative, and a lesson or story you are trying to understand
objects|letter|Letter|news, confession, delayed communication, and words that need to be received
objects|gift|Gift|recognition, obligation, affection, and an unexpected resource or responsibility
objects|ring|Ring|commitment, continuity, promises, status, and a bond that may feel precious or constraining
objects|necklace|Necklace|value, identity, attachment, and something carried close to the heart
objects|shoes|Shoes|direction, readiness, identity, and whether you feel equipped for the path ahead
objects|clothes|Clothes|persona, social role, self-presentation, and how much of yourself you reveal
objects|bag|Bag|responsibility, identity, preparation, and what you feel you must carry
objects|knife|Knife|separation, threat, precision, and the need to cut through or defend a boundary
objects|gun|Gun|fear, power, aggression, vulnerability, and a conflict that feels dangerously escalated
objects|sword|Sword|decisiveness, conflict, truth, and the sharp consequences of taking a position
objects|candle|Candle|hope, attention, remembrance, and a small source of guidance in uncertainty
objects|lamp|Lamp|clarity, study, safety, and bringing focused light to something unclear
objects|mask|Mask|persona, concealment, performance, and uncertainty about what someone truly feels
objects|crown|Crown|status, responsibility, recognition, and the burden or appeal of authority
body|hair|Hair|identity, vitality, attractiveness, and concerns about control or self-presentation
body|hair-loss|Hair Loss|vulnerability, aging concerns, identity change, and fear of losing confidence or power
body|blood|Blood|life force, injury, family ties, sacrifice, and emotion experienced as urgent or visceral
body|hands|Hands|agency, skill, contact, responsibility, and your ability to act on a situation
body|feet|Feet|grounding, direction, mobility, and your practical connection to the path ahead
body|eyes|Eyes|awareness, truth, surveillance, attraction, and what you are willing or afraid to see
body|blindness|Blindness|uncertainty, denial, lack of information, and moving without confidence in what lies ahead
body|mouth|Mouth|speech, appetite, expression, and anxiety about what can or cannot be said
body|voice-lost|Losing Your Voice|powerlessness, inhibition, fear of not being heard, and blocked self-expression
body|pregnancy|Pregnancy|development, anticipation, vulnerability, and something new taking shape over time
body|birth|Birth|emergence, difficult beginnings, creativity, and a new role or identity entering life
body|injury|Injury|vulnerability, limitation, concern, and awareness that some part of life needs care
body|scar|Scar|memory, resilience, old hurt, and evidence of an experience that changed you
body|illness|Illness|depletion, worry, vulnerability, and a symbolic need for care rather than a diagnosis
body|paralysis|Paralysis|helplessness, blocked action, fear, and awareness that you cannot move as you wish
body|running|Running|effort, urgency, avoidance, ambition, and whether you move toward or away from something
body|dancing|Dancing|expression, coordination, pleasure, social rhythm, and balance between control and spontaneity
body|crying|Crying|release, grief, relief, and emotion that waking life may not have allowed enough room
body|laughing|Laughing|joy, release, social connection, nervousness, or a tension being punctured
body|vomiting|Vomiting|rejection, disgust, purging, and the need to expel something emotionally difficult
body|eating|Eating|need, nourishment, appetite, pleasure, and what you are trying to take in or satisfy
body|hunger|Hunger|lack, longing, ambition, deprivation, and a need that has not been adequately met
body|sleeping|Sleeping|withdrawal, restoration, avoidance, and a wish to be temporarily unreachable
body|tattoo|Tattoo|identity, permanence, belonging, and a choice or mark you want remembered
body|aging|Aging|time, maturity, loss, wisdom, and concern about change that cannot be reversed
travel|car|Car|personal direction, control, independence, and how confidently you are steering your life
travel|bus|Bus|shared direction, routine, dependence on a system, and moving on another timetable
travel|train|Train|momentum, collective direction, inevitability, and following a track already laid
travel|airplane|Airplane|ambition, rapid transition, distance, and rising above ordinary constraints
travel|boat|Boat|emotional navigation, uncertainty, resilience, and how well you stay afloat
travel|bicycle|Bicycle|balance, effort, self-propulsion, and progress that depends on your rhythm
travel|motorcycle|Motorcycle|risk, independence, speed, and an urge for a more exposed kind of freedom
travel|truck|Truck|heavy responsibility, practical work, and carrying more than an ordinary load
travel|taxi|Taxi|temporary dependence, chosen direction without personal control, and paid passage
travel|ship|Ship|long journeys, collective fate, emotional scale, and commitment to a direction
travel|submarine|Submarine|deep emotional exploration, secrecy, isolation, and going below the visible surface
travel|rocket|Rocket|ambition, acceleration, escape, and a goal dramatically beyond the ordinary
travel|driving|Driving|control, responsibility, direction, and the consequences of how you steer
travel|passenger|Passenger|reduced control, trust, dependence, and letting another person determine direction
travel|crash|Crash|sudden disruption, fear of failure, collision of plans, and consequences hard to stop
travel|flat-tire|Flat Tire|delay, loss of momentum, practical frustration, and a small failure blocking progress
travel|missed-flight|Missed Flight|timing anxiety, regret, fear of lost opportunity, and concern about being left behind
travel|lost-luggage|Lost Luggage|identity, preparedness, vulnerability, and arriving without what you rely on
travel|road|Road|life direction, options, distance, and the condition of the path you are following
travel|crossroads|Crossroads|choice, uncertainty, competing futures, and the need to commit to a direction
travel|traffic|Traffic|delay, frustration, crowding, and feeling blocked by systems outside your control
travel|speeding|Speeding|impatience, risk, urgency, and concern that life is moving faster than judgment
travel|parking|Parking|pause, belonging, space, and difficulty finding where you fit or can safely stop
travel|map|Map|planning, orientation, knowledge, and the wish for clearer guidance
travel|passport|Passport|identity, permission, mobility, and access to a different world or phase
nightmares|monster|Monster|fear given a face, disowned emotion, and a threat larger than ordinary language
nightmares|demon|Demon|guilt, fear, intrusive imagery, and moral conflict without implying supernatural attack
nightmares|ghost|Ghost|memory, unfinished grief, absence, and something from the past still emotionally present
nightmares|zombie|Zombie|exhaustion, conformity, numbness, and fear of moving through life without vitality
nightmares|vampire|Vampire|drain, dependency, seduction, and a relationship or demand that feels consuming
nightmares|alien|Alien|otherness, unfamiliarity, social disconnection, and encountering what you cannot categorize
nightmares|intruder|Intruder|boundary violation, vulnerability, fear, and a sense that private space is not secure
nightmares|kidnapping|Kidnapping|loss of agency, coercion, fear, and being pulled away from your chosen direction
nightmares|trapped|Being Trapped|constraint, helplessness, obligation, and awareness that available options feel too narrow
nightmares|suffocating|Suffocating|pressure, panic, restriction, and a situation where you cannot get enough space
nightmares|drowning|Drowning|emotional overwhelm, helplessness, and feelings or demands exceeding your capacity
nightmares|war|War|conflict, divided loyalties, threat, and a situation experienced as all-consuming
nightmares|explosion|Explosion|sudden release, anger, rupture, and pressure that can no longer stay contained
nightmares|murder|Murder|violent symbolic ending, fear, rage, and a wish to eliminate a problem rather than a literal prediction
nightmares|being-attacked|Being Attacked|threat, vulnerability, conflict, and feeling under pressure from a person or role
nightmares|buried-alive|Buried Alive|confinement, silencing, helplessness, and fear of being forgotten or unable to escape
nightmares|darkness|Darkness|uncertainty, fear, lack of information, and entering a situation without reliable orientation
nightmares|shadow-figure|Shadow Figure|ambiguous threat, projection, fear of the unknown, and material not yet named
nightmares|abandoned|Being Abandoned|rejection, loneliness, insecurity, and fear that support will disappear
nightmares|lost-child|Lost Child|vulnerability, responsibility, grief, and concern that something precious has been neglected
nightmares|emergency|Emergency|urgency, overload, fear of consequences, and a sense that something needs immediate attention
nightmares|alarm|Alarm|warning, hypervigilance, deadline pressure, and the mind insisting something cannot be ignored
nightmares|unable-to-scream|Unable to Scream|powerlessness, inhibited expression, fear, and the experience of not being heard
nightmares|locked-room|Locked Room|confinement, secrecy, blocked access, and a problem whose exit is not yet visible
nightmares|end-of-world|End of the World|overwhelming change, catastrophe anxiety, loss of familiar structure, and fear an era is ending
work-success|job-interview|Job Interview|evaluation, ambition, self-presentation, and anxiety about whether you will be chosen
work-success|promotion|Promotion|recognition, responsibility, aspiration, and concern that success will change expectations
work-success|fired|Being Fired|rejection, insecurity, identity loss, and fear that your contribution is not valued
work-success|late-for-work|Late for Work|time pressure, guilt, responsibility, and concern about failing expectations
work-success|presentation|Presentation|visibility, evaluation, competence, and anxiety about being watched while performing
work-success|meeting|Meeting|coordination, judgment, group dynamics, and unresolved work or social obligations
work-success|uniform|Uniform|role, conformity, belonging, and tension between identity and institutional expectations
work-success|factory|Factory|routine, productivity, repetition, and fear of becoming one part of an impersonal system
work-success|shop|Shop|choice, value, desire, and deciding what is worth acquiring or exchanging
work-success|restaurant|Restaurant|nourishment, social exchange, service, and expectations about having needs met
work-success|lottery|Lottery|hope, chance, fantasy of rescue, and desire for a dramatic shortcut
work-success|winning|Winning|confidence, recognition, competition, and a wish to see effort rewarded
work-success|losing|Losing|fear of failure, comparison, grief, and concern that effort may not be enough
work-success|medal|Medal|achievement, validation, pride, and the wish for visible recognition
work-success|stage|Stage|performance, exposure, creativity, and awareness of being watched
work-success|applause|Applause|approval, validation, belonging, and desire for recognition
work-success|failure|Failure|self-judgment, fear, perfectionism, and the mind rehearsing an unwanted outcome
work-success|deadline|Deadline|time pressure, responsibility, avoidance, and awareness that delay has consequences
work-success|contract|Contract|commitment, obligation, trust, and concern about what you are agreeing to
work-success|signature|Signature|identity, consent, commitment, and making something official or hard to reverse
work-success|desk|Desk|work, study, routine, and the mental load associated with responsibilities
work-success|briefcase|Briefcase|professional identity, secrets, preparation, and burdens carried into work
work-success|rival|Rival|comparison, competitiveness, insecurity, and fear that recognition or opportunity is scarce
work-success|retirement|Retirement|transition, identity, relief, and uncertainty about life without a familiar role
work-success|business|Business|exchange, ambition, risk, strategy, and how you value your own effort
mystical|angel|Angel|comfort, protection, conscience, hope, and an image of guidance rather than proof of a supernatural message
mystical|devil|Devil|temptation, guilt, fear, shadow material, and conflict around desire or morality
mystical|deity|A Deity|ultimate authority, meaning, judgment, awe, and the mind representing something larger than the ordinary self
mystical|prayer|Prayer|hope, surrender, need for help, and the wish to speak beyond immediate control
mystical|ritual|Ritual|order, repetition, intention, and a desire to make transition feel meaningful
mystical|tarot-cards|Tarot Cards|reflection, uncertainty, symbolism, and a wish for a framework that can organize choices
mystical|crystal|Crystal|clarity, value, fragility, and the desire to see or preserve something pure
mystical|magic|Magic|possibility, control, wonder, and a wish to change circumstances outside ordinary rules
mystical|witch|Witch|power, fear, intuition, outsider identity, and culturally loaded ideas about forbidden knowledge
mystical|wizard|Wizard|knowledge, mastery, mentorship, and a wish to solve problems through hidden understanding
mystical|oracle|Oracle|guidance, ambiguity, fate, and a wish for an answer when evidence feels insufficient
mystical|prophecy|Prophecy|anticipation, anxiety about the future, pattern-seeking, and a desire for certainty
mystical|fortune-teller|Fortune Teller|uncertainty, projection, trust, and the wish to have someone else name what comes next
mystical|haunted-house|Haunted House|memory, fear, family history, and familiar inner space populated by unresolved material
mystical|ouija-board|Ouija Board|curiosity, fear, taboo, suggestion, and anxiety about losing control of meaning-making
mystical|pentagram|Pentagram|symbolic protection, taboo, cultural association, and the emotional charge of a powerful sign
mystical|cross|Cross|faith, burden, sacrifice, conscience, and the weight or comfort of inherited meaning
mystical|statue|Statue|idealization, stillness, memory, and something fixed that cannot respond
mystical|ancient-ruins|Ancient Ruins|history, loss, buried knowledge, and contact with something old but still meaningful
mystical|treasure|Treasure|value, discovery, hidden potential, and reward found through exploration
mystical|secret-room|Secret Room|hidden memory, unexplored identity, private knowledge, and a part of life not yet opened
mystical|portal|Portal|transition, escape, possibility, and crossing into a radically different state
mystical|labyrinth|Labyrinth|complexity, initiation, confusion, and a path whose meaning emerges through persistence
mystical|fortune|Fortune|hope, chance, destiny language, and uncertainty about what is deserved or controllable
mystical|synchronicity|Synchronicity|pattern recognition, meaning, coincidence, and the mind linking events into a coherent story
`;

function aliasesFor(slug: string, title: string): string[] {
  const lower = title.toLowerCase();
  return Array.from(new Set([slug.replace(/-/g, " "), lower, lower.replace(/^being /, ""), lower.replace(/^a /, "")])).filter(Boolean);
}

export const EXPANDED_DREAM_SEEDS: ExpandedDreamSeed[] = RAW.trim().split("\n").map((line) => {
  const [category, slug, title, theme] = line.split("|");
  if (!category || !slug || !title || !theme) throw new Error(`Invalid dream seed: ${line}`);
  return { category, slug, title, theme, aliases: aliasesFor(slug, title) };
});
