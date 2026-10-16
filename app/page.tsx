import { preload } from 'react-dom';
import { MEDIA } from '@/lib/media';
import { HERO } from '@/lib/data';
import { mediaSrc } from '@/components/Photo';
import Preloader from '@/components/Preloader';
import Header from '@/components/Header';
import Curtain from '@/components/Curtain';
import ProgramIndex from '@/components/ProgramIndex';
import NextProgram from '@/components/NextProgram';
import ProducerWord from '@/components/ProducerWord';
import StageSteps from '@/components/StageSteps';
import Ribbon from '@/components/Ribbon';
import CaseSiberia from '@/components/CaseSiberia';
import Constellation from '@/components/Constellation';
import Services from '@/components/Services';
import ContactSheet from '@/components/ContactSheet';
import Intermission from '@/components/Intermission';
import CurtainCall from '@/components/CurtainCall';
import Footer from '@/components/Footer';
import Motion from '@/components/Motion';

export default function Page() {
  // первый кадр сцены — главный кандидат LCP: AVIF с тем же srcset, что у <picture>
  const hero = HERO.slides[0];
  preload(mediaSrc(hero, 800, 'avif'), {
    as: 'image',
    type: 'image/avif',
    fetchPriority: 'high',
    imageSizes: '100vw',
    imageSrcSet: MEDIA[hero].widths.map((w) => `${mediaSrc(hero, w, 'avif')} ${w}w`).join(', '),
  });
  return (
    <>
      <a href="#program" className="skip">
        К программе
      </a>
      <Preloader />
      <Header />
      <main>
        <Curtain />
        <ProgramIndex />
        <NextProgram />
        <ProducerWord />
        <StageSteps />
        <Ribbon id="a" variant="diag" />
        <CaseSiberia />
        <Constellation />
        <Ribbon id="b" variant="soft" />
        <Services />
        <ContactSheet />
        <Intermission />
        <CurtainCall />
      </main>
      <Footer />
      <Motion />
    </>
  );
}
