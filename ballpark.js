// Native SVG ballpark: the base coordinates match the card animation system exactly.
export const ballparkSVG=`<svg viewBox="0 0 800 720" preserveAspectRatio="none" aria-hidden="true">
<defs>
 <linearGradient id="cpSky" x2="0" y2="1"><stop stop-color="#0c1824"/><stop offset="1" stop-color="#243b3c"/></linearGradient>
 <linearGradient id="cpGrass" x2="0" y2="1"><stop stop-color="#386a46"/><stop offset=".55" stop-color="#497f50"/><stop offset="1" stop-color="#315b3e"/></linearGradient>
 <linearGradient id="cpClay" x2=".5" y2="1"><stop stop-color="#be8754"/><stop offset=".55" stop-color="#c79261"/><stop offset="1" stop-color="#a86d43"/></linearGradient>
 <linearGradient id="cpWall" x2="0" y2="1"><stop stop-color="#36625e"/><stop offset="1" stop-color="#163a36"/></linearGradient>
 <radialGradient id="cpLamp"><stop stop-color="#fff9d9" stop-opacity=".85"/><stop offset=".2" stop-color="#fff9d9" stop-opacity=".22"/><stop offset="1" stop-color="#fff9d9" stop-opacity="0"/></radialGradient>
 <pattern id="cpSeats" width="24" height="20" patternUnits="userSpaceOnUse"><rect width="24" height="20" fill="#233e44"/><path d="M2 19H24" stroke="#162b32" stroke-width="3"/><rect x="3" y="9" width="16" height="6" rx="3" fill="#5d7575"/><circle cx="9" cy="7" r="3" fill="#d8b794"/><path d="M5 13v-2q4-6 8 0v2" fill="#c9d7be"/><circle cx="19" cy="5" r="2.5" fill="#c59677"/><path d="M16 11v-2q3-4 6 0v2" fill="#b86b52"/></pattern>
 <pattern id="cpSeatBlue" width="25" height="21" patternUnits="userSpaceOnUse"><rect width="25" height="21" fill="#244447"/><path d="M0 20H25" stroke="#182e34" stroke-width="3"/><rect x="3" y="9" width="17" height="7" rx="3" fill="#627f79"/><circle cx="8" cy="7" r="3" fill="#d6b89a"/><path d="M4 14v-3q4-5 8 0v3" fill="#79a6b0"/><circle cx="20" cy="6" r="2.5" fill="#c6987d"/><path d="M17 13v-3q3-4 6 0v3" fill="#e0c67f"/></pattern>
 <pattern id="cpMow" width="96" height="96" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="48" height="96" fill="#c1df8b" opacity=".10"/><rect x="48" width="48" height="96" fill="#123b28" opacity=".10"/></pattern>
 <pattern id="cpGrain" width="31" height="25" patternUnits="userSpaceOnUse"><circle cx="3" cy="5" r=".6" fill="#72452b" opacity=".2"/><circle cx="14" cy="18" r=".8" fill="#f2d0a2" opacity=".25"/><circle cx="24" cy="9" r=".5" fill="#765036" opacity=".22"/></pattern>
 <clipPath id="cpFair"><path d="M400 636 44 314Q400-90 756 314Z"/></clipPath>
 <filter id="cpShadow"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#081c15" flood-opacity=".45"/></filter>
</defs>
<rect width="800" height="720" fill="url(#cpSky)"/>
<!-- Two horseshoe decks, concourse aisles, and individual crowd seats. -->
<path d="M-40 353Q400-245 840 353L840 150Q400-305-40 150Z" fill="url(#cpSeats)"/>
<path d="M-30 276Q400-194 830 276" fill="none" stroke="#8a9b8b" stroke-width="9"/>
<path d="M-30 285Q400-184 830 285" fill="none" stroke="#172e34" stroke-width="8"/>
<path d="M-30 330Q400-155 830 330L830 285Q400-184-30 285Z" fill="url(#cpSeatBlue)"/>
<g stroke="#a6ad99" stroke-width="7" opacity=".65"><path d="M85 227 44 297M197 126 171 189M600 124 628 189M714 227 755 297"/></g>
<path d="M17 340Q400-115 783 340" fill="none" stroke="#5d705f" stroke-width="14"/>
<path d="M29 333Q400-108 771 333" fill="none" stroke="#c7ab7c" stroke-width="9"/>
<!-- Scoreboard and luxury boxes above center field. -->
<g filter="url(#cpShadow)"><rect x="281" y="9" width="238" height="62" rx="6" fill="#12292d" stroke="#7c9283" stroke-width="2"/><rect x="291" y="19" width="218" height="41" rx="2" fill="#082c26"/><text x="400" y="35" fill="#dceaa4" font-family="Georgia,serif" font-size="18" font-weight="bold" text-anchor="middle" letter-spacing="4">CARDPARK</text><text x="400" y="51" fill="#9aba9c" font-family="sans-serif" font-size="7" text-anchor="middle" letter-spacing="3">UNDER THE LIGHTS • PLAY BALL</text></g>
<g fill="#c9d2bc" opacity=".3"><rect x="201" y="30" width="50" height="19"/><rect x="551" y="30" width="50" height="19"/></g>
<!-- Foul territory and the fair playing surface. -->
<path d="M400 701-12 372Q400-120 812 372Z" fill="#786f57"/>
<path d="M400 665 33 320Q400-94 767 320Z" fill="#bd9d70"/>
<path d="M400 636 44 314Q400-90 756 314Z" fill="url(#cpGrass)"/>
<rect x="15" y="70" width="770" height="595" clip-path="url(#cpFair)" fill="url(#cpMow)"/>
<!-- Curved wall, warning track, padded panels, and advertisements. -->
<path d="M44 314Q400-90 756 314" fill="none" stroke="#b99468" stroke-width="24"/>
<path d="M35 301Q400-108 765 301" fill="none" stroke="#152e2e" stroke-width="18"/>
<path d="M37 300Q400-101 763 300" fill="none" stroke="url(#cpWall)" stroke-width="13"/>
<path d="M35 291Q400-113 765 291" fill="none" stroke="#cad49f" stroke-width="3"/>
<g fill="#d0d8bb" font-family="sans-serif" font-weight="bold" font-size="9" letter-spacing="1"><text x="147" y="153" transform="rotate(-22 147 153)">WORK • PLAY • REPEAT</text><text x="556" y="124" transform="rotate(22 556 124)">CLUTCH COUNTRY</text><text x="360" y="103" font-size="11">400 FT</text></g>
<g stroke="#102d28" stroke-width="2" opacity=".6"><path d="M96 191 102 205M207 129 213 142M302 99 305 111M493 97 489 109M598 129 591 141M704 191 696 204"/></g>
<!-- Infield clay cut, crisp grass diamond, and maintained basepaths. -->
<path d="M400 650 144 443Q400 55 656 443Z" fill="url(#cpClay)"/>
<path d="M400 650 144 443Q400 55 656 443Z" fill="url(#cpGrain)"/>
<path d="M400 606 231 453 400 307 569 453Z" fill="url(#cpGrass)"/>
<path d="M400 606 231 453 400 307 569 453Z" fill="url(#cpMow)"/>
<path d="M400 634 600 454 400 281 200 454Z" fill="none" stroke="#e1ba89" stroke-width="24" stroke-linejoin="round"/>
<path d="M400 634 600 454 400 281 200 454Z" fill="none" stroke="#a87348" stroke-width="1" opacity=".25"/>
<path d="M400 634 44 314M400 634 756 314" stroke="#fff5d9" stroke-width="2.5" fill="none"/>
<!-- Mound and home-plate circle. -->
<ellipse cx="400" cy="434" rx="38" ry="27" fill="#426c45" opacity=".4"/><ellipse cx="400" cy="432" rx="34" ry="24" fill="url(#cpClay)"/><ellipse cx="400" cy="432" rx="34" ry="24" fill="url(#cpGrain)"/><rect x="388" y="429" width="24" height="6" rx="1" fill="#f8efce" filter="url(#cpShadow)"/>
<ellipse cx="400" cy="635" rx="53" ry="38" fill="url(#cpClay)"/><ellipse cx="400" cy="635" rx="53" ry="38" fill="url(#cpGrain)"/>
<g fill="#fff8df" stroke="#b8ae8c" stroke-width="1" filter="url(#cpShadow)"><rect x="592" y="446" width="16" height="16" transform="rotate(43 600 454)"/><rect x="392" y="273" width="16" height="16" transform="rotate(45 400 281)"/><rect x="192" y="446" width="16" height="16" transform="rotate(47 200 454)"/><path d="M391 627H409V638L400 646 391 638Z"/></g>
<g stroke="#f7e8c8" fill="none" stroke-width="1.8" opacity=".9"><path d="M370 622H350V651H370ZM430 622H450V651H430Z"/><path d="M371 665Q400 675 429 665"/></g>
<!-- Foul poles, dugouts, bullpen, and on-deck circles. -->
<g stroke="#e8c45c" stroke-width="4"><path d="M43 314V238M757 314V238"/></g><g stroke="#e8c45c" stroke-width="1" opacity=".7"><path d="M44 245H59V287H44M756 245H741V287H756"/></g>
<g filter="url(#cpShadow)"><path d="M47 445 130 523 116 539 32 460Z" fill="#203e3b" stroke="#96a587" stroke-width="2"/><path d="M753 445 670 523 684 539 768 460Z" fill="#203e3b" stroke="#96a587" stroke-width="2"/><path d="M49 452 123 523M751 452 677 523" stroke="#bca477" stroke-width="5"/><path d="M36 463 112 536M764 463 688 536" stroke="#102d2d" stroke-width="7"/></g>
<g stroke="#e6d1ac" fill="none" opacity=".6"><ellipse cx="264" cy="612" rx="19" ry="12"/><ellipse cx="536" cy="612" rx="19" ry="12"/></g>
<!-- Ballpark lamps: restrained glow and directed light across the field. -->
<g><path d="M80 30V113M720 30V113" stroke="#91a79c" stroke-width="3"/><rect x="52" y="30" width="56" height="19" rx="3" fill="#293e45"/><rect x="692" y="30" width="56" height="19" rx="3" fill="#293e45"/><g fill="#fff3c1"><path d="M57 35h9v9h-9zm13 0h9v9h-9zm13 0h9v9h-9zm13 0h8v9h-8zM697 35h9v9h-9zm13 0h9v9h-9zm13 0h9v9h-9zm13 0h8v9h-8z"/></g><ellipse cx="80" cy="40" rx="100" ry="90" fill="url(#cpLamp)"/><ellipse cx="720" cy="40" rx="100" ry="90" fill="url(#cpLamp)"/></g>
<path d="M0 653Q400 798 800 653V720H0Z" fill="#102b2c" opacity=".8"/>
<text x="400" y="699" text-anchor="middle" fill="#d7e1b8" font-family="sans-serif" font-size="9" letter-spacing="5">HOME OF THE NEXT GREAT GAME</text>
</svg>`;
