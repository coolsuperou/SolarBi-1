/**
 * \u8f66\u95f4\u8def\u7531\u5143\u6570\u636e\uff08\u4ec5 path + meta\uff0c\u65e0 component\uff09
 * title / workshop\uff1a\u4e0e back2 WorkshopEnum \u4e00\u81f4\uff0c\u4e2d\u6587\u7528 \\u \u8f6c\u4e49\u907f\u514d\u7f16\u7801\u635f\u574f
 */
export const workshopRouteEntries = [
  { path: '/feeding-workshop', meta: { title: '101\u914d\u6599', apiBase: 'feeding-workshop', workshop: '101\u914d\u6599', permKey: 'feeding-workshop', icon: 'bi-funnel', group: 'front' } },
  { path: '/granule-102', meta: { title: '102\u9020\u7c92', apiBase: 'granule102', workshop: '102\u9020\u7c92', permKey: 'granule-102', icon: 'bi-circle', group: 'front' } },
  { path: '/granulation-workshop', meta: { title: '102\u9020\u7c92\u73af\u4fdd\u8bbe\u5907', apiBase: 'granulation-workshop', workshop: '102\u9020\u7c92\u73af\u4fdd\u8bbe\u5907', permKey: 'granulation-workshop', icon: 'bi-recycle', group: 'front' } },
  { path: '/cold-press-103', meta: { title: '103\u51b7\u538b', apiBase: 'cold-press-103', workshop: '103\u51b7\u538b', permKey: 'cold-press-103', icon: 'bi-snow', group: 'front' } },
  { path: '/restoration-104', meta: { title: '104\u8fd8\u539f', apiBase: 'restoration-104', workshop: '104\u8fd8\u539f', permKey: 'restoration-104', icon: 'bi-arrow-counterclockwise', group: 'front' } },
  { path: '/sintering-105', meta: { title: '105\u70e7\u7ed3', apiBase: 'sintering-105', workshop: '105\u70e7\u7ed3', permKey: 'sintering-105', icon: 'bi-fire', group: 'front' } },
  { path: '/pressless-sintering', meta: { title: '\u65e0\u538b\u70e7\u7ed3', apiBase: 'pressless-sintering', workshop: '\u65e0\u538b\u70e7\u7ed3', permKey: 'pressless-sintering', icon: 'bi-fire', group: 'pressless' } },
  { path: '/cleaning-106', meta: { title: '106\u6e05\u6d17', apiBase: 'cleaning-106', workshop: '106\u6e05\u6d17', permKey: 'cleaning-106', icon: 'bi-droplet', group: 'back' } },
  { path: '/beading-107', meta: { title: '107\u4e32\u73e0', apiBase: 'beading-107', workshop: '107\u4e32\u73e0', permKey: 'beading-107', icon: 'bi-gem', group: 'back' } },
  { path: '/rubber-109', meta: { title: '109\u70bc\u80f6', apiBase: 'rubber-109', workshop: '109\u70bc\u80f6', permKey: 'rubber-109', icon: 'bi-vinyl', group: 'back' } },
  { path: '/injection-110', meta: { title: '110\u6ce8\u5c04', apiBase: 'injection-110', workshop: '110\u6ce8\u5c04', permKey: 'injection-110', icon: 'bi-eyedropper', group: 'back' } },
  { path: '/injection-workshop', meta: { title: '110\u6ce8\u5c04\u73af\u4fdd\u8bbe\u5907', apiBase: 'injection-workshop', workshop: '110\u6ce8\u5c04\u73af\u4fdd\u8bbe\u5907', permKey: 'injection-workshop', icon: 'bi-recycle', group: 'back' } },
  { path: '/edging-111', meta: { title: '111\u5f00\u5203', apiBase: 'edging-111', workshop: '111\u5f00\u5203', permKey: 'edging-111', icon: 'bi-scissors', group: 'back' } },
  { path: '/final-inspection-112', meta: { title: '112\u7ec8\u68c0', apiBase: 'final-inspection-112', workshop: '112\u7ec8\u68c0', permKey: 'final-inspection-112', icon: 'bi-check-circle', group: 'public' } },
  { path: '/warehouse-113', meta: { title: '113\u4ed3\u5e93', apiBase: 'warehouse113', workshop: '113\u4ed3\u5e93', permKey: 'warehouse-113', icon: 'bi-box', group: 'public' } },
  { path: '/public-114', meta: { title: '114\u516c\u5171', apiBase: 'public114', workshop: '114\u516c\u5171', permKey: 'public-114', icon: 'bi-building', group: 'public' } },
  { path: '/air-conditioning', meta: { title: '114_\u7a7a\u8c03\u6c34\u673a\u4e3b\u673a', apiBase: 'air-conditioning', workshop: '114_\u7a7a\u8c03\u6c34\u673a\u4e3b\u673a', permKey: 'air-conditioning', icon: 'bi-thermometer', group: 'public' } },
  { path: '/air-compressor-114', meta: { title: '114\u7a7a\u538b\u673a', apiBase: 'aircompressor114', workshop: '114\u7a7a\u538b\u673a', permKey: 'air-compressor-114', icon: 'bi-cpu', group: 'public' } },
  { path: '/elevator-114', meta: { title: '114_2#\u5382\u623f\u7535\u68af', apiBase: 'elevator114', workshop: '114_2#\u5382\u623f\u7535\u68af', permKey: 'elevator-114', icon: 'bi-arrow-up-square', group: 'public' } },
  { path: '/office-area-114', meta: { title: '114_2#\u697c\u529e\u516c\u533a\u57df', apiBase: 'officearea114', workshop: '114_2#\u697c\u529e\u516c\u533a\u57df', permKey: 'office-area-114', icon: 'bi-pc-display', group: 'public' } },
  { path: '/conference-room-114', meta: { title: '114_2#\u697c\u4f1a\u8bae\u5ba4', apiBase: 'conferenceroom114', workshop: '114_2#\u697c\u4f1a\u8bae\u5ba4', permKey: 'conference-room-114', icon: 'bi-people', group: 'public' } },
  { path: '/laboratory-114', meta: { title: '114_2#\u697c\u5b9e\u9a8c\u5ba4', apiBase: 'laboratory114', workshop: '114_2#\u697c\u5b9e\u9a8c\u5ba4', permKey: 'laboratory-114', icon: 'bi-flask', group: 'public' } },
  { path: '/office-building', meta: { title: '1#\u529e\u516c\u697c', apiBase: 'office-building', workshop: '1#\u529e\u516c\u697c', permKey: 'office-building', icon: 'bi-building', group: 'other' } },
  { path: '/tool-rd-center', meta: { title: '\u5de5\u5177\u7814\u53d1\u4e2d\u5fc3', apiBase: 'toolrdcenter', workshop: '\u5de5\u5177\u7814\u53d1\u4e2d\u5fc3', permKey: 'tool-rd-center', icon: 'bi-tools', group: 'other' } },
  { path: '/charging-pile', meta: { title: '\u5145\u7535\u6869', apiBase: 'chargingpile', workshop: '\u5145\u7535\u6869', permKey: 'charging-pile', icon: 'bi-lightning-charge', group: 'other' } },
  { path: '/guard-room', meta: { title: '\u95e8\u536b\u5ba4', apiBase: 'guardroom', workshop: '\u95e8\u536b\u5ba4', permKey: 'guard-room', icon: 'bi-shield', group: 'other' } },
  { path: '/canteen', meta: { title: '\u98df\u5802', apiBase: 'canteen', workshop: '\u98df\u5802', permKey: 'canteen', icon: 'bi-cup-hot', group: 'other' } },
  { path: '/dormitory', meta: { title: '\u5bbf\u820d\u697c', apiBase: 'dormitory', workshop: '\u5bbf\u820d\u697c', permKey: 'dormitory', icon: 'bi-house', group: 'other' } }
]
