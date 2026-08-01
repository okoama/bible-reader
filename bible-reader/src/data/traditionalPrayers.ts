import type { Prayer } from '../types';

const now = new Date('2025-01-01').toISOString();
const common = { category: 'prayers' as const, favorite: false, answered: false, createdAt: now, updatedAt: now, lastPrayed: null };

export const TRADITIONAL_PRAYERS: Prayer[] = [
  {
    id: 'traditional:our-father',
    title: 'Our Father',
    tags: ['our-father', 'lord\'s-prayer'],
    content: `<p>Our Father, who art in heaven,<br/>
hallowed be thy name;<br/>
thy kingdom come;<br/>
thy will be done on earth as it is in heaven.</p>

<p>Give us this day our daily bread;<br/>
and forgive us our trespasses<br/>
as we forgive those who trespass against us;<br/>
and lead us not into temptation,<br/>
but deliver us from evil. Amen.</p>`,
    ...common,
  },
  {
    id: 'traditional:hail-mary',
    title: 'Hail Mary',
    tags: ['hail-mary', 'ave-maria'],
    content: `<p>Hail, Mary, full of grace,<br/>
the Lord is with thee;<br/>
blessed art thou among women,<br/>
and blessed is the fruit of thy womb, Jesus.</p>

<p>Holy Mary, Mother of God,<br/>
pray for us sinners,<br/>
now and at the hour of our death. Amen.</p>`,
    ...common,
  },
  {
    id: 'traditional:glory-be',
    title: 'Glory Be',
    tags: ['glory-be', 'doxology'],
    content: `<p>Glory be to the Father,<br/>
and to the Son,<br/>
and to the Holy Spirit.</p>

<p>As it was in the beginning,<br/>
is now, and ever shall be,<br/>
world without end. Amen.</p>`,
    ...common,
  },
  {
    id: 'traditional:apostles-creed',
    title: 'Apostles\' Creed',
    tags: ['creed', 'apostles-creed'],
    content: `<p>I believe in God, the Father almighty,<br/>
Creator of heaven and earth,<br/>
and in Jesus Christ, his only Son, our Lord,<br/>
who was conceived by the Holy Spirit,<br/>
born of the Virgin Mary,<br/>
suffered under Pontius Pilate,<br/>
was crucified, died, and was buried;<br/>
he descended into hell;<br/>
on the third day he rose again from the dead;<br/>
he ascended into heaven,<br/>
and is seated at the right hand of God the Father almighty;<br/>
from there he will come to judge the living and the dead.</p>

<p>I believe in the Holy Spirit,<br/>
the holy catholic Church,<br/>
the communion of saints,<br/>
the forgiveness of sins,<br/>
the resurrection of the body,<br/>
and life everlasting. Amen.</p>`,
    ...common,
  },
  {
    id: 'traditional:nicene-creed',
    title: 'Nicene Creed',
    tags: ['creed', 'nicene-creed'],
    content: `<p>I believe in one God,<br/>
the Father almighty,<br/>
maker of heaven and earth,<br/>
of all things visible and invisible.</p>

<p>I believe in one Lord Jesus Christ,<br/>
the Only Begotten Son of God,<br/>
born of the Father before all ages.<br/>
God from God, Light from Light,<br/>
true God from true God,<br/>
begotten, not made, consubstantial with the Father;<br/>
through him all things were made.<br/>
For us men and for our salvation<br/>
he came down from heaven,<br/>
and by the Holy Spirit was incarnate of the Virgin Mary,<br/>
and became man.</p>

<p>For our sake he was crucified under Pontius Pilate,<br/>
he suffered death and was buried,<br/>
and rose again on the third day<br/>
in accordance with the Scriptures.<br/>
He ascended into heaven<br/>
and is seated at the right hand of the Father.<br/>
He will come again in glory<br/>
to judge the living and the dead,<br/>
and his kingdom will have no end.</p>

<p>I believe in the Holy Spirit, the Lord, the giver of life,<br/>
who proceeds from the Father and the Son,<br/>
who with the Father and the Son is adored and glorified,<br/>
who has spoken through the prophets.</p>

<p>I believe in one, holy, catholic and apostolic Church.<br/>
I confess one baptism for the forgiveness of sins,<br/>
and I look forward to the resurrection of the dead<br/>
and the life of the world to come. Amen.</p>`,
    ...common,
  },
  {
    id: 'traditional:act-of-contrition',
    title: 'Act of Contrition',
    tags: ['contrition', 'penance', 'confession'],
    content: `<p>O my God, I am heartily sorry<br/>
for having offended Thee,<br/>
and I detest all my sins<br/>
because of Thy just punishments,<br/>
but most of all because they offend Thee, my God,<br/>
who art all-good and deserving of all my love.</p>

<p>I firmly resolve,<br/>
with the help of Thy grace,<br/>
to sin no more<br/>
and to avoid the near occasion of sin. Amen.</p>`,
    ...common,
  },
  {
    id: 'traditional:st-michael',
    title: 'St. Michael the Archangel',
    tags: ['st-michael', 'archangel', 'spiritual-warfare'],
    content: `<p>St. Michael the Archangel,<br/>
defend us in battle.<br/>
Be our protection against the wickedness and snares of the devil.<br/>
May God rebuke him, we humbly pray;<br/>
and do thou, O Prince of the Heavenly Host,<br/>
by the power of God,<br/>
thrust into hell Satan and all the evil spirits<br/>
who prowl about the world seeking the ruin of souls. Amen.</p>`,
    ...common,
  },
  {
    id: 'traditional:anima-christi',
    title: 'Anima Christi',
    tags: ['anima-christi', 'soul-of-christ', 'eucharist'],
    content: `<p>Soul of Christ, sanctify me.<br/>
Body of Christ, save me.<br/>
Blood of Christ, inebriate me.<br/>
Water from the side of Christ, wash me.<br/>
Passion of Christ, strengthen me.<br/>
O good Jesus, hear me.<br/>
Within Thy wounds, hide me.<br/>
Suffer me not to be separated from Thee.<br/>
From the malignant enemy, defend me.<br/>
At the hour of death, call me.<br/>
And bid me come unto Thee,<br/>
that with all Thy saints I may praise Thee<br/>
for all eternity. Amen.</p>`,
    ...common,
  },
];

export const TRADITIONAL_PRAYER_IDS = new Set(TRADITIONAL_PRAYERS.map((p) => p.id));

export function isTraditionalPrayer(id: string): boolean {
  return TRADITIONAL_PRAYER_IDS.has(id);
}
