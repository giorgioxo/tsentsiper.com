const projectData = [
  `154
  Self-initiated: Comprehensive research of an ordinary residential building`,
  `153
  Major grocery store chain: Self-checkout process redesign`,
  `152
  Lifestyle media publisher: Openair music and culture festival`,
  `151
  Telemetrics manufacturer: Digital ecosystem strategy for fleet owners`,
  `150
  Mixed-use developer: Product concept for a 12.4 acres urban redevelopment project`,
  `149
  Major grocery store chain: AR in-store experience`,
  `148
  Lifestyle media publisher: New food magazine and website`,
  `147
  Premium residential developer: Product concept for a 35.3 acres mixed-use suburban brownfield development`,
  `146
  Ethnographic museum: Open air exhibition on local history and crafts`,
  `145
  Major insurance company: New healthcare insurance product`,
  `144
  New luxury hotel: Ground floor destination in the downtown`,
  `143
  Lifestyle media publisher: Travel guidebooks series`,
  `142
  Express delivery service: Experience and design for a new beauty and self-care goods department`,
  `141
  Urban design center: New events space with educational and research programs on urban design`,
  `140
  Major grocery store chain: Brand media about food, home and lifestyle`,
  `139
  Office developer: User experience for a 2.500.000 sq. ft. suburban Class-A office cluster`,
  `138
  Premium residential developer: Services and amenities for a 4.7 acres residential development`,
  `137
  Online beauty retailer: New offline flagship beauty and self-care store`,
  `136
  Lifestyle media publisher: New travel magazine and website`,
  `135
  Midmarket developer: Product concept for a new chain of colivings`,
  `134
  New luxury hotel: Branding`,
  `133
  Major grocery store chain: Social responsibility strategy with focus on a community building`,
  `132
  Lifestyle media publisher: City culture and events magazine`,
  `131
  Leading wellness app: Rebranding`,
  `130
  Self-initiated: Comprehensive research of an ordinary residential building`,
  `129
  Major grocery store chain: Self-checkout process redesign`,
  `128
  Lifestyle media publisher: Openair music and culture festival`,
  `127
  Telemetrics manufacturer: Digital ecosystem strategy for fleet owners`,
  `126
  Mixed-use developer: Product concept for a 12.4 acres urban redevelopment project`,
  `125
  Major grocery store chain: AR in-store experience`,
  `124
  Lifestyle media publisher: New food magazine and website`,
  `123
  Premium residential developer: Product concept for a 35.3 acres mixed-use suburban brownfield development`,
  `122
  Ethnographic museum: Open air exhibition on local history and crafts`,
  `121
  Major insurance company: New healthcare insurance product`,
  `120
  New luxury hotel: Ground floor destination in the downtown`,
  `119
  Lifestyle media publisher: Travel guidebooks series`,
  `118
  Express delivery service: Experience and design for a new beauty and self-care goods department`,
  `117
  Urban design center: New events space with educational and research programs on urban design`,
  `116
  Major grocery store chain: Brand media about food, home and lifestyle`,
  `115
  Office developer: User experience for a 2.500.000 sq. ft. suburban Class-A office cluster`,
  `114
  Premium residential developer: Services and amenities for a 4.7 acres residential development`,
  `113
  Online beauty retailer: New offline flagship beauty and self-care store`,
  `112
  Lifestyle media publisher: New travel magazine and website`,
  `111
  Midmarket developer: Product concept for a new chain of colivings`,
  `110
  New luxury hotel: Branding`,
  `109
  Major grocery store chain: Social responsibility strategy with focus on a community building`,
  `108
  Lifestyle media publisher: City culture and events magazine`,
  `107
  Leading wellness app: Rebranding`,
  `106
  Self-initiated: Comprehensive research of an ordinary residential building`,
  `105
  Major grocery store chain: Self-checkout process redesign`,
  `104
  Lifestyle media publisher: Openair music and culture festival`,
  `103
  Telemetrics manufacturer: Digital ecosystem strategy for fleet owners`,
  `102
  Mixed-use developer: Product concept for a 12.4 acres urban redevelopment project`,
  `101
  Major grocery store chain: AR in-store experience`,
  `100
  Leading wellness app: Rebranding`,
  `99
  Midmarket developer: Product concept for a new chain of colivings`,
  `98
  Major grocery store chain: AR in-store experience`,
  `97
  Office developer: User experience for a 2.500.000 sq. ft. suburban Class-A office cluster`,
  `96
  Premium residential developer: Product concept for a 35.3 acres mixed-use suburban brownfield development`,
  `95
  Online beauty retailer: New offline flagship beauty and self-care store`,
  `94
  Premium residential developer: Services and amenities for a 4.7 acres residential development`,
  `93
  Major insurance company: New healthcare insurance product`,
  `92
  Urban design center: New events space with educational and research programs on urban design`,
  `91
  Express delivery service: Experience and design for a new beauty and self-care goods department`,
  `90
  Major grocery store chain: Brand media about food, home and lifestyle`,
  `89
  New luxury hotel: Branding`,
  `88
  Self-initiated: Comprehensive research of an ordinary residential building`,
  `87
  New luxury hotel: Ground floor destination in the downtown`,
  `86
  Ethnographic museum: Open air exhibition on local history and crafts`,
  `85
  Major grocery store chain: Self-checkout process redesign`,
  `84
  Major grocery store chain: Social responsibility strategy with focus on a community building`,
  `83
  Telemetrics manufacturer: Digital ecosystem strategy for fleet owners`,
  `82
  Mixed-use developer: Product concept for a 12.4 acres urban redevelopment project`,
  `81
  Regional mass housing developer: Rebranding`,
  `80
  Mixed-use developer: Product concept for a 14.8 acres historic urban restoration`,
  `79
  Online marketplace: Offline flagship store concept`,
  `78
  Foodtech startup: Branding`,
  `77
  Educational startup: Branding`,
  `76
  Internet and home security provider: New products`,
  `75
  Instant delivery service: New social shopping features`,
  `74
  Self-initiated: Research of new workspace types`,
  `73
  International arts festival: Branding (with Indgila Samad Ali)`,
  `72
  Nonprofit festival producer: Branding`,
  `71
  Leading international food and home care company: Baby food shopping experience strategy`,
  `70
  Сity government: Citizen experience concept`,
  `69
  Private club: Space, events and services`,
  `68
  Internet and home security provider: Product vision`,
  `67
  Major bank: Content for mobile application`,
  `66
  Agro-industrial producer: Customer experience strategy for small and medium size clients`,
  `65
  Major grocery store chain: Checkout process redesign`,
  `64
  Major bank: Retail branch concept`,
  `63
  Major grocery store chain: New store format concept`,
  `62
  Premium residential developer: Customer experience concept for a 4.3 acres residential development`,
  `61
  Express delivery service: Private label strategy`,
  `60
  Historic museum: Center for Family History Concept`,
  `59
  Сity government: City services strategy`,
  `58
  Major steel company: Onboarding redesign`,
  `57
  Major historic museum and park: Spatial strategy for a memorial center`,
  `56
  Mixed-use developer: Product concept for a 6.4 acres urban redevelopment project`,
  `55
  B2C insurer: New digital product concept for children safety`,
  `54
  Lifestyle goods chain: Chain redesign concept`,
  `53
  Medical clinics chain: Customer experience strategy`,
  `52
  Major insurance company: Rebranding`,
  `51
  Major insurance company: Rebranding of premium products`,
  `50
  Mass housing developer: Rebranding`,
  `49
  Major steel company: Customer experience strategy`,
  `48
  New city in the Middle East: Experience concept (with Meganom, Mobility in Chain and Alexander Brodsky)`,
  `47
  New city in the Middle East: New city's tourist experience concept (with Meganom, Mobility in Chain, TM/R Design and Alexander Brodsky)`,
  `46
  Food markets chain: Branding`,
  `45
  Environmental NGO: Branding`,
  `44
  Cross industrial holding: Educational course on product management for top managers`,
  `43
  Self-initiated: Historic visual identities research`,
  `42
  Business school: Innovation workshops`,
  `41
  Instant delivery service: Product design`,
  `40
  Instant delivery service: Branding`,
  `39
  Bank: New product for young families and families with babies`,
  `38
  Clothing recycling NGO: Rebranding`,
  `37
  Major private insurance company: New employees onboarding`,
  `36
  Major private insurance company: Employee experience strategy`,
  `35
  Major private insurance company: Employer brand`,
  `34
  Property management platform: Mobile app design`,
  `33
  Chain of household appliances stores: Omnichannel customer experience`,
  `32
  Mixed-use developer: Creative cluster concept`,
  `31
  Premium-class residential developer: Services and amenities concept for a 3.1 acres residential development`,
  `30
  Premium-class residential developer: Customer experience concept for a 5.6 acres residential development`,
  `29
  DIY stores chain: Delivery process design`,
  `28
  Glass manufacturing company: Corporate campus and educational platform concept`,
  `27
  Diabetes drug research company: Branding`,
  `26
  Property management platform: Branding`,
  `25
  Luxury residential developer: Branding for a skyscraper`,
  `24
  Fashion retailer: Branding (with Maria Doreuli)`,
  `23
  Polytechnic Museum: Branding`,
  `22
  Local shopping center chain: Branding`,
  `21
  Cosmetics retailer: Flagship store concept`,
  `20
  Premium-class residential developer: Branding for a premium-class residential complex`,
  `19
  Premium-class residential developer: Buyer experience design`,
  `18
  City government: Historic park with a number of museums and complex natural heritage on 593 acres`,
  `17
  Museum of science: Product strategy`,
  `16
  National post operator: Product strategy`,
  `15
  National post operator: Digital channels experience design`,
  `14
  National post operator: New web portal`,
  `13
  Startup: New home renovation service`,
  `12
  Startup: New home renovation service branding`,
  `11
  Leading bank: Retail branch concept`,
  `10
  Mass housing developer: Branding`,
  `9
  Mixed-use developer: Product concept for a 15.8 acres urban redevelopment project`,
  `8
  Educational NGO: Post graduate institute for media, architecture and design with a big public program`,
  `7
  Lifestyle media publisher: Leading city listings online media`,
  `6
  NGO: 544 acres downtown park with significant cultural and natural heritage`,
  `5
  Lifestyle media publisher: New food magazine and website`,
  `4
  Lifestyle media publisher: New travel magazine and website`,
  `3
  Lifestyle media publisher: Openair music and culture festival`,
  `2
  Lifestyle media publisher: Travel guidebooks series`,
  `1
  Lifestyle media publisher: City culture and events magazine`
];

module.exports = projectData;

