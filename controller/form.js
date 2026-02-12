angular.module("formApp", []).controller("FormController", [
  "$scope",
  "$http",
  "$filter",
  function ($scope, $http, $filter) {
    $scope.formData = {};
    $scope.today = new Date();
    $scope.waktuTersedia = [];
    $scope.chosen = false;
    $scope.done = false;

    $scope.toggleWaktu = function (waktu) {
      waktu.checked = !waktu.checked;
    };

    $scope.submitForm = function () {
      let parokiFinal = $scope.formData.pilihanParoki;
      if ($scope.formData.pilihanParoki === "Lainnya") {
        parokiFinal = $scope.formData.parokiCustom;
      }

      const waktuTerpilih = $scope.waktuTersedia
        .filter((w) => w.checked)
        .map((w) => w.label);

      if ($scope.bookingForm.$invalid || waktuTerpilih.length === 0) {
        let msg = "Mohon lengkapi semua field dan pilih waktu.\n";
        if ($scope.bookingForm.paroki.$invalid)
          msg += "- Paroki belum dipilih\n";
        if (
          $scope.bookingForm.parokiLain &&
          $scope.bookingForm.parokiLain.$invalid
        )
          msg += "- Nama paroki lainnya belum diisi\n";
        if ($scope.bookingForm.nama.$invalid) msg += "- Nama belum diisi\n";
        if ($scope.bookingForm.subseksi.$invalid)
          msg += "- Subseksi/Wilayah/Acara belum diisi\n";
        if ($scope.bookingForm.ruangan.$invalid)
          msg += "- Ruangan belum dipilih\n";
        if ($scope.bookingForm.tanggal.$invalid)
          msg += "- Tanggal belum diisi\n";
        if (waktuTerpilih.length === 0) msg += "- Waktu belum dipilih\n";
        if ($scope.bookingForm.wa.$invalid)
          msg += "- Nomor WhatsApp tidak valid\n";
        if ($scope.bookingForm.Alasan.$invalid)
          msg += "- Alasan pemakaian belum diisi\n";
        alert(msg);
      } else {
        if (waktuTerpilih.length > 3 && $scope.formData.ruangan !== "Oliver") {
          alert("Maksimal 3 jam pemakaian!");
        } else {
          $scope.done = true;

          const payload = Object.assign({}, $scope.formData);
          payload.paroki = parokiFinal;
          payload.waktu = waktuTerpilih;

          console.log(waktuTerpilih);

          const deconstructedWaktu = waktuTerpilih.reduce((acc, current) => {
            return acc.concat(current.split("-"));
          }, []);

          console.log(deconstructedWaktu);

          let formattedWaktu = "";
          let lastTime = "";
          let lastTimeNum = 0;

          for (let i = 0; i < deconstructedWaktu.length; i += 2) {
            if (i == 0) {
              formattedWaktu = deconstructedWaktu[i];
            } else if (i == deconstructedWaktu.length - 2) {
              if (deconstructedWaktu[i] != deconstructedWaktu[i - 1]) {
                formattedWaktu +=
                  "-" +
                  deconstructedWaktu[i - 1] +
                  ", " +
                  deconstructedWaktu[i];
              }
              formattedWaktu += "-" + deconstructedWaktu[i + 1];
            } else {
              if (deconstructedWaktu[i] != deconstructedWaktu[i - 1]) {
                formattedWaktu +=
                  "-" +
                  deconstructedWaktu[i - 1] +
                  ", " +
                  deconstructedWaktu[i];
              }
            }
          }

          const formEncoded = new URLSearchParams(payload).toString();

          const endpoint =
            "https://script.google.com/macros/s/AKfycbzDoqig8KdVrK7RUFdIAbQnzJEfZbRIKOZLa9bn-ABZsKq0RVd5ZGb3ju2DIjyTOKIIpA/exec";

          $http({
            method: "POST",
            url: endpoint,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            data: formEncoded,
          }).then(
            function success() {
              const msg =
                `Halo PIC Ruangan,%0A` +
                `Saya ingin mengajukan peminjaman ruangan:%0A%0A` +
                `Nama: ${payload.nama}%0A` +
                `Paroki: ${payload.paroki}%0A` +
                `Subseksi: ${payload.subseksi}%0A` +
                `Ruangan: ${payload.ruangan}%0A` +
                `Tanggal: ${payload.tanggal.toDateString()}%0A` +
                `Waktu: ${formattedWaktu}%0A` +
                `WA: ${payload.wa}%0A` +
                `Alasan: ${payload.Alasan}%0A%0A` +
                `Mohon konfirmasi dan bantuannya untuk akses smart door. Terima kasih.`;

              window.open(`https://wa.me/6285117552527?text=${msg}`, "_blank");
            },
            function error() {
              $scope.done = false;
              alert("Gagal mengirim data.");
            },
          );
        }
      }
    };

    $scope.updateDisabledCheckboxes = function () {
      if (!$scope.formData.tanggal || !$scope.formData.ruangan) return;
      else {
        $scope.waktuTersedia = [];
        $scope.chosen = true;
        $scope.waiting = true;
      }

      $http
        .get(
          "https://script.google.com/macros/s/AKfycbzDoqig8KdVrK7RUFdIAbQnzJEfZbRIKOZLa9bn-ABZsKq0RVd5ZGb3ju2DIjyTOKIIpA/exec",
        )
        .then(function (res) {
          const booked = res.data;
          const allWaktu = [
            "08:00-09:00",
            "09:00-10:00",
            "10:00-11:00",
            "11:00-12:00",
            "12:00-13:00",
            "13:00-14:00",
            "14:00-15:00",
            "15:00-16:00",
            "16:00-17:00",
            "17:00-18:00",
            "18:00-19:00",
            "19:00-20:00",
            "20:00-21:00",
            "21:00-22:00",
          ];

          const selectedDate = new Date($scope.formData.tanggal).toDateString();
          const selectedRoom = $scope.formData.ruangan;

          if (selectedRoom === "Oliver") {
            const waktuTersisa = allWaktu.map((w) => ({
              label: w,
              checked: false,
            }));
            $scope.waktuTersedia = waktuTersisa;
            $scope.waiting = false;
          } else {
            let waktuTerpakai = [];

            booked.forEach((entry) => {
              const entryDate = new Date(entry.tanggal).toDateString();
              if (
                entryDate === selectedDate &&
                entry.ruangan === selectedRoom
              ) {
                if (entry.waktu.length > 0) {
                  const timeStr = entry.waktu[0];
                  const times = timeStr.split(",").map((t) => t.trim());
                  waktuTerpakai = waktuTerpakai.concat(times);
                }
              }
            });

            const waktuTersisa = allWaktu.map((w) => ({
              label: w,
              checked: false,
              disabled: waktuTerpakai.includes(w),
            }));

            $scope.waktuTersedia = waktuTersisa;
            $scope.waiting = false;
          }
        });
    };
  },
]);
