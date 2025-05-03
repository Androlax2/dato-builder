import BlockBuilder from "./BlockBuilder";
import {configureDatoClient} from "./config";

configureDatoClient({
    apiToken: "4138815ad42637c8ad7268e303618e",
});

const TestBlock = new BlockBuilder("Block yolo").addInteger("super integer", {
    validators: {
        required: true,
    },
});

void TestBlock.upsert();
