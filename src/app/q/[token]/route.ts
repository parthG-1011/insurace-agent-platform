import { getProposalBundleByToken } from "@/lib/data/queries";
import { pdfDataFromBundle } from "@/lib/pdf/from-bundle";
import { buildProposalPdf } from "@/lib/pdf/proposal-pdf";
import { proposalReference } from "@/lib/tokens";

// Public: customers open this from WhatsApp. The unguessable token is the access control.
export async function GET(_request: Request, ctx: RouteContext<"/q/[token]">) {
  const { token } = await ctx.params;
  const bundle = await getProposalBundleByToken(token);
  if (!bundle) return new Response("Proposal not found", { status: 404 });

  const bytes = await buildProposalPdf(pdfDataFromBundle(bundle));
  const filename = `${proposalReference(bundle.proposal.id)}-${bundle.product.name.replace(/[^A-Za-z0-9]+/g, "-")}.pdf`;
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
