import {edhDispatcher} from "../../src/functions/edhDispatcher";
import {DispatchService} from "../../src/services/DispatchService";
import {Configuration} from "../../src/utils/Configuration";
import {Context} from "aws-lambda";
import {AWSError} from "aws-sdk";

describe("edhDispatcher function", () => {
  // @ts-ignore
  const ctx: Context = null;
  // @ts-ignore
  Configuration.instance = new Configuration("../../src/config/config.yml");

  describe("if the event is undefined", () => {
    it("should return undefined", async () => {
      expect.assertions(1);
      const result = await edhDispatcher(undefined, ctx, () => { return; });
      expect(result).toBe(undefined);
    });
  });

  describe("if the event has no records", () => {
    it("should return undefined", async () => {
      expect.assertions(1);
      const result = await edhDispatcher({something: "not records"}, ctx, () => { return; });
      expect(result).toBe(undefined);
    });
  });

  describe("with good event", () => {
    it("invokes the dispatch service with the right body and target", async () => {
      const body = {test: "value"};
      const event = {
        Records: [
          {
            body: JSON.stringify(body),
            eventSourceARN: 'arn:aws:sqs:eu-west-1:006106226016:cvs-edh-dispatcher-test-results-cvsb-10773-queue'
          }
        ],
      };
      const processMock = jest.fn();
      jest.spyOn(DispatchService.prototype, "processEvent").mockImplementation(processMock);
      await edhDispatcher(event, ctx, () => {});
      expect(processMock).toBeCalledWith(event.Records[0]);
    });
    describe("and ProcessEvent returns a rejection",  () => {
      it("throws the error upwards", async () => {
        const body = {test: "value"};
        const event = {
          Records: [
            {
              body: JSON.stringify(body),
              eventSourceARN: 'arn:aws:sqs:eu-west-1:006106226016:cvs-edh-dispatcher-test-results-cvsb-10773-queue'
            }
          ],
        };
        const error = new Error("something bad");
        const processMock = jest.spyOn(DispatchService.prototype, "processEvent").mockReturnValue(Promise.reject(error));
        expect.assertions(2);
        try {
          await edhDispatcher(event, ctx, () => {});
        } catch (e) {
          expect(e).toEqual(error);
          expect(processMock).toBeCalledWith(event.Records[0]);
        }
      });
    });
    describe("and ProcessEvent returns a process resolve",  () => {
      it("returns the resolution value", async () => {
        const body = {test: "value"};
        const event = {
          Records: [
            {
              body: JSON.stringify(body),
              eventSourceARN: 'arn:aws:sqs:eu-west-1:006106226016:cvs-edh-dispatcher-test-results-cvsb-10773-queue'
            }
          ],
        };
        const resp = "all good";
        const processMock = jest.spyOn(DispatchService.prototype, "processEvent").mockReturnValue(Promise.resolve(resp));
        expect.assertions(2);
        const output = await edhDispatcher(event, ctx, () => {});
        expect(output).toEqual([resp]);
        expect(processMock).toBeCalledWith(event.Records[0]);
      });
    });
  });
});
