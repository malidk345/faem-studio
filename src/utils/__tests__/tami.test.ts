import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { TamiPayment } from '../tami.ts';
import type { TamiConfig, PaymentOrder, PaymentCard } from '../tami.ts';

class MockElement {
  public tagName: string;
  public children: MockElement[] = [];
  public style: any = {};
  public type?: string;
  public name?: string;
  public value?: string;
  public method?: string;
  public action?: string;

  constructor(tagName: string) {
    this.tagName = tagName;
  }

  appendChild(child: MockElement) {
    this.children.push(child);
  }

  submit() {}
}

const mockDocument = {
  createElement: (tag: string) => new MockElement(tag),
  body: {
    appendChild: () => {}
  }
};

globalThis.document = mockDocument as any;

describe('TamiPayment', () => {
    before(() => {
        mock.method(Math, 'random', () => 0.123456789);
    });

    after(() => {
        mock.restoreAll();
    });

    it('should generate correct 3D secure form', async () => {
        const config: TamiConfig = {
            clientId: '123456',
            storeKey: 'SECRET_KEY',
            apiUrl: 'https://test.tami.com.tr/3d',
            okUrl: 'https://test.com/ok',
            failUrl: 'https://test.com/fail'
        };

        const order: PaymentOrder = {
            orderId: 'ORD-001',
            amount: 100.50,
            currency: '949',
            installment: ''
        };

        const card: PaymentCard = {
            cardHolderName: 'John Doe',
            cardNumber: '4111 1111 1111 1111',
            expireMonth: '12',
            expireYear: '25',
            cvv: '123'
        };

        const tami = new TamiPayment(config);
        const form = await tami.create3DSecureForm(order, card) as unknown as MockElement;

        assert.strictEqual(form.method, 'POST');
        assert.strictEqual(form.action, config.apiUrl);
        assert.strictEqual(form.style.display, 'none');

        // Check input fields
        const inputs = form.children.reduce((acc, child) => {
            if (child.name) {
                acc[child.name] = child.value;
            }
            return acc;
        }, {} as Record<string, string | undefined>);

        assert.strictEqual(inputs['clientid'], '123456');
        assert.strictEqual(inputs['storetype'], '3d');
        assert.strictEqual(inputs['islemtipi'], 'Auth');
        assert.strictEqual(inputs['amount'], '100.50');
        assert.strictEqual(inputs['currency'], '949');
        assert.strictEqual(inputs['oid'], 'ORD-001');
        assert.strictEqual(inputs['okUrl'], 'https://test.com/ok');
        assert.strictEqual(inputs['failUrl'], 'https://test.com/fail');
        assert.strictEqual(inputs['taksit'], '');

        // Random should be fixed due to mock (0.123456789.toString(36).substring(2, 15) === "4fzyo82mvyc")
        const expectedRnd = 0.123456789.toString(36).substring(2, 15);
        assert.strictEqual(inputs['rnd'], expectedRnd);

        // Card Details
        assert.strictEqual(inputs['pan'], '4111111111111111');
        assert.strictEqual(inputs['cv2'], '123');
        assert.strictEqual(inputs['Ecom_Payment_Card_ExpDate_Year'], '25');
        assert.strictEqual(inputs['Ecom_Payment_Card_ExpDate_Month'], '12');
        assert.strictEqual(inputs['cardType'], '1'); // Visa starts with 4 (defaults to 1)

        // Ensure hash is present and valid string
        assert.ok(inputs['hash']);
        assert.strictEqual(typeof inputs['hash'], 'string');
    });

    it('should correctly set Troy cardType when starting with 9', async () => {
      const config: TamiConfig = {
          clientId: '123456',
          storeKey: 'SECRET_KEY',
          apiUrl: 'https://test.tami.com.tr/3d',
          okUrl: 'https://test.com/ok',
          failUrl: 'https://test.com/fail'
      };

      const order: PaymentOrder = {
          orderId: 'ORD-002',
          amount: 50.00,
          currency: '949'
      };

      const card: PaymentCard = {
          cardHolderName: 'Jane Doe',
          cardNumber: '9792 1111 1111 1111',
          expireMonth: '01',
          expireYear: '26',
          cvv: '456'
      };

      const tami = new TamiPayment(config);
      const form = await tami.create3DSecureForm(order, card) as unknown as MockElement;

      const inputs = form.children.reduce((acc, child) => {
          if (child.name) {
              acc[child.name] = child.value;
          }
          return acc;
      }, {} as Record<string, string | undefined>);

      assert.strictEqual(inputs['cardType'], 'Troy');
    });
});
