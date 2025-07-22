import { BlockBuilder, type BuilderContext } from "dato-builder";

export default async function buildStripePayButtonBlock({
  config,
}: BuilderContext) {
  return new BlockBuilder({
    name: "Stripe Pay Button",
    config,
  })
    .addText({
      label: "Button ID",
      body: {
        validators: {
          required: true,
        },
      },
    })
    .upsert();
}
