describe("Already Open Reopen", () => {
  let webExtension, background, huluContainer;

  describe("Add-on initializes with already open Tabs", () => {
    beforeEach(async () => {
      webExtension = await loadWebExtension({
        async beforeParse(window) {
          huluContainer = await window.browser.contextualIdentities._create({
            name: "Hulu"
          });
          await window.browser.tabs._create({
            url: "https://www.hulu.com"
          });
          await window.browser.tabs._create({
            url: "https://example.com",
            cookieStoreId: huluContainer.cookieStoreId
          });
          await window.browser.tabs._create({
            url: "https://dontreopen.me"
          });
        }
      });
      background = webExtension.background;
    });

    it("should reopen already open tabs if necessary", () => {
      expect(background.browser.tabs.create).to.have.been.calledTwice;
      expect(background.browser.tabs.create).to.have.been.calledWithMatch({
        url: "https://www.hulu.com",
        cookieStoreId: huluContainer.cookieStoreId
      });
      expect(background.browser.tabs.create).to.have.been.calledWithMatch({
        url: "https://example.com",
        cookieStoreId: "firefox-default"
      });
      expect(background.browser.tabs.create).to.not.have.been.calledWithMatch({
        url: "https://dontreopen.me"
      });
    });
  });

  describe("Add-on initializes with already open but still loading Tab", () => {
    let tab;

    beforeEach(async () => {
      webExtension = await loadWebExtension({
        async beforeParse(window) {
          huluContainer = await window.browser.contextualIdentities._create({
            name: "Hulu"
          });
          tab = await window.browser.tabs._create({
            url: "about:blank",
            status: "loading"
          });
        }
      });
      background = webExtension.background;
    });

    it("should wait for still loading tabs and then reopen them", async () => {
      expect(background.browser.tabs.create).to.not.have.been.called;
      tab.url = "https://www.hulu.com";
      const [promise] = background.browser.tabs.onUpdated.addListener.yield(tab.id, {
        url: tab.url,
        status: "complete"
      }, tab);
      await promise;

      expect(background.browser.tabs.create).to.have.been.calledWithMatch({
        url: "https://www.hulu.com",
        cookieStoreId: huluContainer.cookieStoreId
      });
      expect(background.browser.tabs.create).to.have.been.calledOnce;
    });
  });

  describe("Add-on initializes with already open but incognito Tab", () => {
    beforeEach(async () => {
      webExtension = await loadWebExtension({
        async beforeParse(window) {
          huluContainer = await window.browser.contextualIdentities._create({
            name: "Hulu"
          });
          await window.browser.tabs._create({
            url: "https://dontreopenincognito.me",
            cookieStoreId: huluContainer.cookieStoreId,
            incognito: true
          });
        }
      });
      background = webExtension.background;
    });

    it("should not reopen", async () => {
      expect(background.browser.tabs.create).to.not.have.been.calledOnce;
    });
  });

  describe("Add-on initializes with already open complete about:blank Tab", () => {
    beforeEach(async () => {
      webExtension = await loadWebExtension({
        async beforeParse(window) {
          huluContainer = await window.browser.contextualIdentities._create({
            name: "Hulu"
          });
          await window.browser.tabs._create({
            url: "about:blank",
            cookieStoreId: huluContainer.cookieStoreId,
            status: "complete"
          });
        }
      });
      background = webExtension.background;
    });

    it("should not reopen", async () => {
      expect(background.browser.tabs.create).to.not.have.been.calledOnce;
    });
  });
});