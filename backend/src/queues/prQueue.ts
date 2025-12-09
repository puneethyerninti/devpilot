import { Queue } from "bullmq";
import { connection } from "./connection";

export type PRJobPayload = {
  type: "test";
  payload: {
    msg: string;
  };
};

export const prQueue = new Queue<PRJobPayload>("prQueue", {
  connection,
});
