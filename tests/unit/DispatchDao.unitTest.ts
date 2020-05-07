import {LambdaService} from "../../src/services/LambdaService";
import {Configuration} from "../../src/utils/Configuration";
import AWS from "aws-sdk"
import restoreAllMocks = jest.restoreAllMocks;

describe("DispatchDAO", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  afterAll(() => {
    jest.restoreAllMocks();
  })

  describe("invoke function", () => {
    const invokeMock = jest.fn();
    // @ts-ignore
    jest.spyOn(AWS, "Lambda").mockImplementation(() => {
      return {
        invoke: invokeMock
      }
    })
    const svc = new LambdaService();
    const body = {test:"body"};
    invokeMock.mockReturnValueOnce("All Good");
    it("sends the right details and returns the response value", async () => {
      expect.assertions(2)
      const output = await svc.invoke("testName", body);
      expect(output).toEqual("All Good");
      expect(invokeMock.mock.calls[0][0]).toEqual({
        FunctionName: 'testName',
        InvocationType: 'Event',
        Payload: '{"test":"body"}'
      })
    });
  });
  // describe("putMessage", () => {
  //   it("invokes promise.put with correct message", async () => {
  //     const output = await svc.putMessage({}, "something");
  //     expect(putMock).toHaveBeenCalled();
  //     expect(postMock).not.toHaveBeenCalled();
  //     expect(deleteMock).not.toHaveBeenCalled();
  //     expect(putMock.mock.calls[0][0].method).toEqual("PUT");
  //     expect(putMock.mock.calls[0][0].uri).toEqual("http://myEndpoint.com/something");
  //     expect(putMock.mock.calls[0][0].body).toEqual("{}");
  //     expect(putMock.mock.calls[0][0].headers["x-api-key"]).toEqual(secrets.apiKey);
  //     expect(putMock.mock.calls[0][0].headers["host"]).toEqual(secrets.host);
  //   })
  // });
  // describe("postMessage", () => {
  //   it("invokes promise.post with correct message", async () => {
  //     const output = await svc.postMessage({}, "something");
  //     expect(postMock).toHaveBeenCalled();
  //     expect(putMock).not.toHaveBeenCalled();
  //     expect(deleteMock).not.toHaveBeenCalled();
  //     expect(postMock.mock.calls[0][0].method).toEqual("POST");
  //     expect(postMock.mock.calls[0][0].uri).toEqual("http://myEndpoint.com/something");
  //     expect(postMock.mock.calls[0][0].body).toEqual("{}");
  //     expect(postMock.mock.calls[0][0].headers["x-api-key"]).toEqual(secrets.apiKey);
  //     expect(postMock.mock.calls[0][0].headers["host"]).toEqual(secrets.host);    })
  // });
  // describe("deleteMessage", () => {
  //   it("invokes promise.delete with correct message", async () => {
  //     const output = await svc.deleteMessage("something");
  //     expect(deleteMock).toHaveBeenCalled();
  //     expect(putMock).not.toHaveBeenCalled();
  //     expect(postMock).not.toHaveBeenCalled();
  //     expect(deleteMock.mock.calls[0][0].method).toEqual("DELETE");
  //     expect(deleteMock.mock.calls[0][0].uri).toEqual("http://myEndpoint.com/something");
  //     expect(deleteMock.mock.calls[0][0].body).toBeUndefined();
  //     expect(deleteMock.mock.calls[0][0].headers["x-api-key"]).toEqual(secrets.apiKey);
  //     expect(deleteMock.mock.calls[0][0].headers["host"]).toEqual(secrets.host);    })
  // });
});
