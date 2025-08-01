
import HelpArticleLayout from "@/components/help/HelpArticleLayout";
import { CreditCard, ArrowUpRight, CheckSquare, AlertTriangle, Key } from "lucide-react";
import { Link } from "react-router-dom";

const UpgradePlanArticle = () => {
  return (
    <HelpArticleLayout 
      title="Upgrading your subscription plan"
      category="Billing & Plans"
      categoryLink="/help/billing"
      lastUpdated="1 week ago"
    >
      <p>
        Ready to access more features and manage larger guest lists? This guide will walk you through 
        the process of upgrading your Saahitt Guest Manager subscription plan.
      </p>

      <h2>Available Plans</h2>
      <p>
        Saahitt Guest Manager offers three subscription tiers:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div className="border border-gray-200 rounded-lg p-5">
          <h3 className="font-semibold text-lg mb-2">Free Plan</h3>
          <p className="text-[#FF6F00] font-medium mb-3">Nrs. 0</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Up to 100 guests</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Basic guest management</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Basic PDF exports</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Manual RSVP tracking</span>
            </li>
          </ul>
        </div>
        
        <div className="border-2 border-[#FF6F00] rounded-lg p-5 relative">
          <div className="absolute top-0 right-0 bg-[#FF6F00] text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
            Popular
          </div>
          <h3 className="font-semibold text-lg mb-2">Advanced Plan</h3>
          <p className="text-[#FF6F00] font-medium mb-3">Nrs. 1,500</p>
          <p className="text-xs text-gray-500 mb-3">One-time payment</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Up to 300 guests</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Advanced filtering & sorting</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Excel/CSV export</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Custom fields & tags</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Branded PDF exports</span>
            </li>
          </ul>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-5">
          <h3 className="font-semibold text-lg mb-2">Ultimate Plan</h3>
          <p className="text-[#FF6F00] font-medium mb-3">Nrs. 5,000</p>
          <p className="text-xs text-gray-500 mb-3">One-time payment</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Unlimited guests</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>AI-powered smart ranking</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>Digital invites via email & WhatsApp</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>RSVP tracking & reminders</span>
            </li>
            <li className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
              <span>All Advanced plan features</span>
            </li>
          </ul>
        </div>
      </div>

      <p className="text-center mb-6">
        <Link to="/pricing" className="inline-flex items-center text-[#FF6F00] font-medium hover:underline">
          View full plan comparison <ArrowUpRight className="ml-1 h-4 w-4" />
        </Link>
      </p>

      <h2>How to Upgrade Your Plan</h2>
      <p>
        You can upgrade your plan in just a few simple steps:
      </p>

      <h3>From Your Dashboard</h3>
      <ol>
        <li>Log in to your Saahitt Guest Manager account</li>
        <li>Click on <strong>Settings</strong> in the main navigation</li>
        <li>Select <strong>Plan Management</strong> from the settings menu</li>
        <li>Review the available plans</li>
        <li>Click <strong>Upgrade</strong> next to your desired plan</li>
        <li>Follow the checkout process to complete your payment</li>
      </ol>

      <div className="my-6 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium">Plan Management Screen</h3>
        </div>
        <div className="p-4">
          <img 
            src="/placeholder.svg" 
            alt="Plan Management Screen" 
            className="w-full rounded border border-gray-200" 
          />
          <p className="text-sm text-gray-500 mt-2 text-center">
            The Plan Management screen in Settings
          </p>
        </div>
      </div>

      <h3>From the Plans Tab</h3>
      <ol>
        <li>Log in to your Saahitt Guest Manager account</li>
        <li>Click on <strong>Plans</strong> in the main navigation</li>
        <li>Review the available plans</li>
        <li>Click <strong>Upgrade</strong> next to your desired plan</li>
        <li>Follow the checkout process to complete your payment</li>
      </ol>

      <h2>Payment Information</h2>
      <p>
        We offer secure payment processing for plan upgrades:
      </p>

      <h3>Accepted Payment Methods</h3>
      <ul>
        <li>Major credit cards (Visa, MasterCard, American Express)</li>
        <li>Debit cards</li>
        <li>E-Sewa (Nepal)</li>
        <li>Khalti (Nepal)</li>
        <li>Bank transfer (for enterprise customers)</li>
      </ul>

      <h3>Billing Details</h3>
      <ul>
        <li>All prices are listed in Nepalese Rupees (Nrs.)</li>
        <li>Plans are one-time payments, not recurring subscriptions</li>
        <li>You'll receive a receipt via email after successful payment</li>
        <li>Tax invoice available on request for business customers</li>
      </ul>

      <div className="flex items-start bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 shrink-0" />
        <div>
          <h3 className="font-medium text-yellow-800">Important</h3>
          <p className="text-yellow-700">
            Plan upgrades take effect immediately after payment is processed. 
            Make sure you're ready to upgrade before completing the checkout process.
          </p>
        </div>
      </div>

      <h2>After Upgrading</h2>
      <p>
        Once your upgrade is complete:
      </p>

      <ol>
        <li>You'll receive a confirmation email with your payment receipt</li>
        <li>Your dashboard will update to show your new plan status</li>
        <li>New features will be unlocked immediately</li>
        <li>Your increased guest limit will be applied automatically</li>
        <li>Any premium templates or tools will appear in your dashboard</li>
      </ol>

      <div className="flex flex-col sm:flex-row gap-4 items-center my-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="sm:w-1/4 flex justify-center">
          <Key className="h-16 w-16 text-[#FF6F00]" />
        </div>
        <div className="sm:w-3/4">
          <h3 className="text-lg font-medium mb-2">Unlock Premium Features</h3>
          <p>
            Need help getting started with your new premium features? Check out our 
            feature-specific guides in the Help Center, or contact our support team for 
            personalized assistance.
          </p>
        </div>
      </div>

      <h2>Frequently Asked Questions</h2>

      <h3>Can I downgrade my plan?</h3>
      <p>
        Since our plans are one-time payments rather than subscriptions, there's no downgrading option.
        However, you're welcome to contact our support team if you have concerns about your current plan.
      </p>

      <h3>Will I lose data if I reach my guest limit?</h3>
      <p>
        No, you won't lose any data. If you reach your guest limit, you'll be prompted to upgrade
        your plan before adding more guests. All your existing data remains intact.
      </p>

      <h3>Is there a trial period for paid plans?</h3>
      <p>
        We don't offer trials for paid plans, but our free plan includes most core features
        so you can thoroughly test the platform before upgrading.
      </p>

      <h3>Can I request a refund?</h3>
      <p>
        We offer a 14-day money-back guarantee if you're not satisfied with your purchase.
        Contact our support team within 14 days of your upgrade to request a refund.
      </p>

      <h2>Need Help?</h2>
      <p>
        If you have questions about upgrading or need assistance with the process:
      </p>
      <ul>
        <li>
          <Link to="/contact" className="text-[#FF6F00] hover:underline">
            Contact our support team
          </Link>
        </li>
        <li>
          <Link to="/help/billing" className="text-[#FF6F00] hover:underline">
            Browse other billing-related help articles
          </Link>
        </li>
        <li>Email us directly at billing@saahitt.com</li>
      </ul>
    </HelpArticleLayout>
  );
};

export default UpgradePlanArticle;
