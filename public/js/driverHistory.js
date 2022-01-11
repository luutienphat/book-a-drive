moment.locale("vi");
const historyPanel = document.getElementById("history-panel");
const moneyPanel = document.getElementById("money-panel");
const vietnamMoneyFormat = (number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });
  return formatter.format(number);
};

const kilometerFormat = (number) => {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "unit",
    unit: "kilometer",
  });
  return formatter.format(number);
};

async function init() {
  const getDriverId = () => {
    return new Promise((resolve) => {
      socket.on("SET_ID", (data) => {
        resolve(data);
      });
    });
  };

  socket.driverId = await getDriverId();

  const renderSwiper = (() => {
    let map = [];

    for (let i = 60; i >= 0; i--) {
      map.push(
        `<div class="swiper-slide text-dark border border-secondary border-2 rounded"
            data-date="${moment()
              .subtract(i, "days")
              .utc(7)
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .toISOString()}"
            data-key="${i}"
            id="button"
        >
            <div><b>${moment().subtract(i, "days").format("dd")}</b></div>
            <div><b>${moment().subtract(i, "days").format("DD/MM")}</b></div>
        </div>`
      );
    }
    let result = map.join("");
    document.getElementById("swiper-wrapper").innerHTML = result;
    swiper.update();
  })(); // run when load

  const renderHistory = (data) => {
    const result = data.map((each) => {
      // console.log(moment.utc(each.GIODATXE).format("HH:mm"));
      return `<div
                    class="d-flex justify-content-center align-items-center py-2 px-2 border border-2 border-success rounded mb-1"
                    id="place-item"
                    data-drive="${each.MACHUYEN}"
                    >
                    <div class="pe-2 overflow-hidden w-100">
                        <h5 class="text-truncate">
                            ${each.DIEMDEN}
                        </h5>
                        <div class="d-flex justify-content-start align-items-center">
                        <p
                            class="text-truncate text-secondary my-0"
                            style="font-size: 14px"
                        >
                            <i class="bi bi-align-center"></i>
                            ${kilometerFormat(each.QUANGDUONG)}
                        </p>
                        <p
                            class="text-truncate text-secondary mx-1 my-0"
                            style="font-size: 14px"
                        >
                            <i class="bi bi-clock-fill"></i>
                            ${moment.utc(each.GIODATXE).format("HH:mm")}
                        </p>
                        <p
                            class="text-truncate text-secondary mx-1 my-0"
                            style="font-size: 14px"
                        >
                            <i class="bi bi-wallet-fill"></i>
                            ${vietnamMoneyFormat(each.TIENCHIETKHAU)}
                        </p>
                        </div>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                        <div class="text-secondary text-nowrap" style="font-size: 14px">
                        <i class="bi bi-cash"></i> Tiền
                        </div>
                        <h4 class="my-0 text-success text-nowrap text-end">
                            ${vietnamMoneyFormat(each.TIEN)}
                        </h4>
                    </div>
                    </div>`;
    });
    historyPanel.innerHTML = result.join("");
  };

  const renderTotal = (data, dateForSeacrh) => {
    let totalMoney = 0,
      totalDiscount = 0,
      totalDrive = 0;
    for (let i = 0; i < data.length; i++) {
      totalMoney += data[i].TIEN;
      totalDiscount += data[i].TIENCHIETKHAU;
    }
    moneyPanel.innerHTML = `<div
                              class="d-flex justify-content-center align-items-center py-3 px-3 border border-3 border-danger rounded"
                              id="place-item"
                              data-address=""
                          >
                              <div class="overflow-hidden w-100">
                              <h5 class="text-truncate text-primary">
                                  ${
                                    data.length == 0
                                      ? moment(dateForSeacrh).format(
                                          "dd DD/MM/YYYY"
                                        )
                                      : moment(data[0].NGAYDATXE).format(
                                          "dd DD/MM/YYYY"
                                        )
                                  }
                              </h5>
                              <div class="d-flex flex-column justify-content-center">
                                  <p
                                  class="text-truncate text-success my-0"
                                  style="font-size: 16px"
                                  >
                                  <i class="bi bi-check2-circle"></i>
                                      ${data.length} đã hoàn thành
                                  </p>
                                  <p
                                  class="text-truncate text-danger my-0"
                                  style="font-size: 16px"
                                  >
                                  <i class="bi bi-wallet-fill"></i>
                                      ${vietnamMoneyFormat(totalDiscount)}
                                  </p>
                              </div>
                              </div>
                              <div class="d-flex flex-column justify-content-center">
                              <div class="text-secondary text-nowrap">
                                  <i class="bi bi-cash"></i> Thu nhập
                              </div>
                                  <h4 class="my-0 text-danger text-nowrap text-end">
                                  ${vietnamMoneyFormat(totalMoney)}
                                  </h4>
                              </div>
                          </div>`;
  };

  const buttons = document.querySelectorAll("#button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const date = button.dataset.date;
      const driverId = socket.driverId;
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].dataset.key == button.dataset.key) {
          buttons[i].classList.remove("border-secondary");
          buttons[i].classList.add("border-primary");
        } else {
          buttons[i].classList.add("border-secondary");
          buttons[i].classList.remove("border-primary");
        }
      }
      axios
        .get(`http://localhost:3001/drives?driverId=${driverId}&&date=${date}`)
        .then((res) => {
          return res.data;
        })
        .then((data) => {
          renderHistory(data);
          renderTotal(data, date);
        });
    });
  });

  buttons[buttons.length - 1].click();
}

init();
