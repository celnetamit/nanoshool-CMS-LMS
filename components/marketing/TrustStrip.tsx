import { PartnerLogoStrip } from './PartnerLogoStrip'

type PartnerItem = {
  id: string
  name: string
  website?: string | null
}

type TrustStripProps = {
  partners: PartnerItem[]
}

export function TrustStrip({ partners }: TrustStripProps) {
  return (
    <PartnerLogoStrip
      kicker="Trust and collaboration"
      heading="Partners and institutions in the NSTC ecosystem"
      body="Support from institutions, industry teams, and research-aligned collaborators helps the public experience feel credible from the first click."
      partners={partners}
    />
  )
}
