// This file returns an invalid builder (not a BlockBuilder instance)
export default function buildInvalidBlock() {
  return {
    // This is not a proper BlockBuilder instance
    invalidMethod: () => "invalid",
  };
}
