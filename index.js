const notifier = require('node-notifier');
const axios = require('axios');

let i = 0;
let isError = false;
const poller = () => {
	const interval = setInterval(() => {
		axios
			.get(
				'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=294&date=21-05-2021',
				{
					headers: {
						Accept: 'application/json',
						Host: 'cdn-api.co-vin.in',
						'User-Agent':
							'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.51',
					},
				}
			)
			.then((res) => {
				if (isError) {
					notifier.notify({
						title: 'Vaccine Alert Resumed',
						message: `Resumed after error`,
					});
					isError = false;
				}
				console.log(Date(), i++);
				const { data } = res;
				const availableSlots = data.centers
					.filter((d) => d.sessions.some((s) => s.min_age_limit === 18 && s.available_capacity_dose1 > 0))
					.map((c) => ({
						pincode: c.pincode,
						date: c.sessions.find((e) => e.min_age_limit === 18).date,
						type: c.fee_type,
					}));
				if (availableSlots.length) {
					availableSlots.forEach((s) =>
						notifier.notify({
							title: 'Vaccine Alert',
							message: `${s.pincode} - ${s.date} - ${s.type}`,
							sound: true,
						})
					);
					clearInterval(interval);
				}
			})
			.catch((err) => {
				clearInterval(interval);
				setTimeout(poller, 10000);
				console.error(`Error at ${Date()}`);
				if (!isError) {
					notifier.notify({
						title: 'Vaccine Alert Error',
						message: `Stopped due to error`,
					});
					isError = true;
				}
			});
	}, 1000);
};

poller();
