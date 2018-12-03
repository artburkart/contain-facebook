describe("Container", () => {
  let webExtension, background;

  describe("Add-on initializes", () => {
    describe("No Container with name Hulu exists", () => {
      beforeEach(async () => {
        webExtension = await loadWebExtension();
        background = webExtension.background;
      });

      it("should create a new Hulu Container", () => {
        expect(background.browser.contextualIdentities.create).to.have.been.calledWithMatch({
          name: "Hulu"
        });
      });
    });

    describe("Container with name Hulu already exists", () => {
      beforeEach(async () => {
        webExtension = await loadWebExtension({
          async beforeParse(window) {
            await window.browser.contextualIdentities._create({
              name: "Hulu"
            });
          }
        });
        background = webExtension.background;
      });

      it("should not create a new Container", () => {
        expect(background.browser.contextualIdentities.create).to.not.have.been.called;
      });
    });
  });
});
