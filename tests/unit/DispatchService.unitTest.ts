import {DispatchService} from "../../src/services/DispatchService";
import {IBody, ITarget} from "../../src/models";
import {ERROR} from "../../src/models/enums";
import {Configuration} from "../../src/utils/Configuration";
import exp from "constants";

describe("Dispatch Service", () => {
  describe("processPath", () => {
    const daoMock = jest.fn();
    const sqsMock = jest.fn();
    const svc = new DispatchService(new daoMock(), new sqsMock());
    describe("with path containing regex match", () => {
      const path = "/test-string/{testStationId}";
      it("replaces it with the matching key of the event", () => {
        const event: IBody = {
          changeType: "CREATE",
          key: "123",
          body: {"test": "value"}
        };

        const output = svc.processPath(path, event);
        expect(output).toEqual("/test-string/123")
      });
    });
    describe("with path containing no regex matches", () => {
      const path = "/test-string/SystemNumber";
      it("returns the original path", () => {
        const event: IBody = {
          changeType: "CREATE",
          key: "123",
          body: {"test": "value"}
        };

        const output = svc.processPath(path, event);
        expect(output).toEqual(path)
      });
    });
  });
  describe("processEvent", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    afterAll(() => {
      secretConfig.mockRestore();
    });
    const invokeMock = jest.fn();
    const sqsMock = jest.fn();
    const daoMock = jest.fn().mockImplementation(() => {
      return {
        invoke: invokeMock
      }
    });
    const sendToDLQMock = jest.spyOn(DispatchService.prototype,"sendRecordToDLQ");
    const secretConfig = jest.spyOn(Configuration.prototype, "getSecretConfig").mockResolvedValue(Promise.resolve({
      baseUrl: "",
      apiKey: "",
      host: ""
    }));
    const target: ITarget = Configuration.getInstance().getTargets()["test-stations"];
    const body = {"test": "value"};
    const svc = new DispatchService(new daoMock(), new sqsMock());

    describe("with invalid event type & Bad ARN", () => {
      const event: IBody = {
        changeType: "CHEESE",
        key: "123",
        body
      };
      const record = {
        body: JSON.stringify(event),
        eventSourceARN: "something-wrong"
      };
      it("invokes nothing, throws error", () => {
        expect.assertions(3);
        try {
          svc.processEvent(record);
        } catch (e) {
          expect(invokeMock).not.toHaveBeenCalled();
          expect(sendToDLQMock).not.toHaveBeenCalled();
          expect(e.message).toEqual(ERROR.NO_UNIQUE_TARGET)
        }
      });
    });

    describe("with invalid event type", () => {
      const event: IBody = {
        changeType: "CHEESE",
        key: "123",
        body
      };
      const record = {
        body: JSON.stringify(event),
        eventSourceARN: "something-test-stations"
      };
      it("invokes sendRecordToDLQ", () => {
        expect.assertions(2);
        svc.processEvent(record);
        expect(invokeMock).not.toHaveBeenCalled();
        expect(sendToDLQMock).toHaveBeenCalled();
      });
    });

    describe("with valid CREATE event type", () => {
      const event: IBody = {
        changeType: "CREATE",
        key: "123",
        body
      };
      const record = {
        body: JSON.stringify(event),
        eventSourceARN: "something-test-stations"
      };
      const expectedOutput = {
        body: "{\"test\":\"value\"}",
        headers: {
          "X-Amzn-Trace-Id": undefined,
        },
        httpMethod: "POST",
        isBase64Encoded: false,
        path: "/test-stations",
        pathParameters: {
          "testStationId": "123",
        }
      }
      it("invokes the POST method with the right details", async () => {
        invokeMock.mockResolvedValue("posted");
        const output = await svc.processEvent(record);
        expect(output).toEqual("posted");
        expect(invokeMock).toHaveBeenCalled();
        expect(invokeMock).toHaveBeenCalledWith("test-stations-local", expectedOutput)
      });
    });

    describe("with valid UPDATE event type", () => {
      const event: IBody = {
        changeType: "UPDATE",
        key: "123",
        body
      };
      const record = {
        body: JSON.stringify(event),
        eventSourceARN: "something-test-stations"
      };
      const expectedOutput = {
        body: "{\"test\":\"value\"}",
        headers: {
          "X-Amzn-Trace-Id": undefined,
        },
        httpMethod: "PUT",
        isBase64Encoded: false,
        path: "/test-stations/123",
        pathParameters: {
          "testStationId": "123",
        }
      }
      it("invokes the PUT method with the right details", async () => {
        const output = await svc.processEvent(record);
        expect(output).not.toBeUndefined();
        expect(invokeMock).toHaveBeenCalled();
        expect(invokeMock).toHaveBeenCalledWith("test-stations-local", expectedOutput)
      });
    });

    describe("with valid DELETE event type", () => {
      const event: IBody = {
        changeType: "DELETE",
        key: "123",
        body
      };
      const record = {
        body: JSON.stringify(event),
        eventSourceARN: "something-test-stations"
      };
      it("invokes the DELETE method with the right details", async () => {
        const svc = new DispatchService(new daoMock(), new sqsMock());

        const output = await svc.processEvent(record);
        expect(output).not.toBeUndefined();
        expect(invokeMock).toHaveBeenCalled();
        expect(invokeMock).toHaveBeenCalledWith("test-stations-local", generateDeleteCallBody())
      });
    });
  });
});

const generateDeleteCallBody = () => {
  return {
    headers: {
      "X-Amzn-Trace-Id": undefined,
    },
    httpMethod: "DELETE",
    isBase64Encoded: false,
    path: "/test-stations/123",
    pathParameters: {
      "testStationId": "123",
    }
  }
}
