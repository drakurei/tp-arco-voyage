function AboutPage() {
  return (
    <div className="text-page">
      <h1 className="mb-4">À propos</h1>
      <p>
        Ce site a été réalisé dans le cadre d'une formation React. Il met en pratique
        React Router, Redux Toolkit, les formulaires validés et
        l'authentification par token.
      </p>
      <p>
        Les destinations, les comptes, les favoris et les commentaires sont
        enregistrés par une API PHP / MySQL ; côté site, tout passe par Redux
        Toolkit. Les photos proviennent de Pixabay et de Wikimedia Commons, les
        cartes d'OpenStreetMap et les avatars de DiceBear.
      </p>
    </div>
  );
}

export default AboutPage;
