import PawooGA from '../../pawoo/actions/ga';

const pawooGaCategory = 'Modal';

export const MODAL_OPEN  = 'MODAL_OPEN';
export const MODAL_CLOSE = 'MODAL_CLOSE';

export function openModal(type, props) {
  PawooGA.event({ category: pawooGaCategory, action: type });

  return {
    type: MODAL_OPEN,
    modalClosable: true,
    modalType: type,
    modalProps: props,
  };
};

export function openModalUnclosable(type, props) {
  return {
    type: MODAL_OPEN,
    modalClosable: false,
    modalType: type,
    modalProps: props,
  };
};

export function closeModal() {
  return {
    type: MODAL_CLOSE,
  };
};
