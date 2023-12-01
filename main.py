class PageResult:

    @staticmethod
    def get_fields():
        return [
            'requested-url',
            'device-type',
            'Performance',
            'Accessibility',
            'Best Practices',
            'SEO',
            'PWA',
            'first-contentful-paint',
            'largest-contentful-paint',
            'speed-index',
            'total-blocking-time'
        ]

    def __init__(self, data):
        self.url = data.get('requestedUrl').rstrip('/')
        self.device_type = self.get_device_type(data.get('environment'))
        self.scores = self.get_scores(data)
        self.id = self.url + self.device_type

    def get_scores(self, data):
        cats = data.get('categories', {})
        scores = {v['title']: int(100*v['score']) for v in cats.values()}
        audits = data.get('audits', {})

        fields = [
            'first-contentful-paint',
            'largest-contentful-paint',
            'speed-index',
            'total-blocking-time'
        ]

        for f in fields:
            if f in audits:
                scores[f] = round(audits[f]['numericValue'] / 1000, 3)

        return scores

    def get_device_type(self, environment):
        try:
            network_agent = environment['networkUserAgent']
            return 'mobile' if 'android' in network_agent.lower() else 'desktop'
        except:
            pass

    def jsonify(self):
        data = {
            'requested-url': self.url,
            'device-type': self.device_type
        }
        data.update(self.scores)
        return data


def main():
    import csv
    import json
    from pathlib import Path

    folder = "pages"
    pathlist = Path(folder).rglob('*.json')
    results = []

    for path in pathlist:
        with open(str(path), "r", encoding='utf-8') as f:
            results.append(PageResult(json.load(f)))

    with open('performance.csv', 'w', newline='') as f:
        header = PageResult.get_fields()
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        for r in results:
            writer.writerow(r.jsonify())


if __name__ == '__main__':
    main()
