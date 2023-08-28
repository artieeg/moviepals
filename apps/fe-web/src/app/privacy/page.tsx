"use client";

import ReactMarkdown from "react-markdown";

export default function Privacy() {
  return (
    <ReactMarkdown
      className="px-8"
      components={{
        h2: (node, ...props) => (
          <div
            className="font-secondary text-2xl font-bold text-neutral-1 dark:text-white mt-14"
            {...props}
          >
            {node.children}
          </div>
        ),
        li: (node, ...props) => (
          <div
            className="font-secondary opacity-70 leading-7 text-neutral-1 dark:text-white text-lg"
            {...props}
          >
            {node.children}
          </div>
        ),
        p: (node, ...props) => (
          <div
            className="font-secondary opacity-70 leading-7 text-neutral-1 dark:text-white text-lg"
            {...props}
          >
            {node.children}
          </div>
        ),
      }}
    >

      {policy}
    </ReactMarkdown>
  );
}

const policy = `
## Privacy Policy

This Privacy Policy explains how MoviePals (“we”, “us”, or “our”) collects, uses, and shares information about you when you use our mobile application (the “App”). By using the App, you agree to the collection, use, and disclosure of information in accordance with this Privacy Policy.

## Information We Collect

### Information You Provide to Us

When you create an account on the App, we collect your email, first name, and username.

### Information We Collect Automatically

We may automatically collect certain information about your device when you use the App, such as your IP address. We do not collect any information about your location.

### Information We Collect from Third Parties

We may receive information about you from third parties, such as Google and Apple, when you sign in to the App using their services.

### Information We Collect from Phone Contacts

With your permission, the App may access your phone contacts to help you find friends who are also using the App. We do not transfer any of your contacts to our servers or to any third parties.

## How We Use Your Information

We use the information we collect from you to:

- Provide, operate, and improve the App
- Personalize your experience with the App
- Communicate with you about the App, including updates and new features
- Analyze how you use the App and how we can improve it
- Enforce our Terms of Service

## How We Share Your Information

We do not share your information with third parties, except as follows:

- With your consent
- With our service providers who need access to the information to perform services for us (e.g., analyzing how the App is used)
- When required by law or to protect our rights

## Security

We take reasonable measures to protect your information from loss, theft, misuse and unauthorized access, disclosure, alteration, and destruction.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. If we make material changes to this Privacy Policy, we will notify you by email or by posting a notice on the App prior to the effective date of the changes. Your continued use of the App after the effective date of such changes constitutes your agreement to such changes.

## Contact Us

If you have any questions or concerns about this Privacy Policy, please contact us at [hey@moviepals.com](mailto:hey@moviepals.com).
`
